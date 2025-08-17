// import { inngest } from "../client.js";
// import Ticket from "../../models/ticket.js";
// import User from "../../models/user.js";
// import { NonRetriableError } from "inngest";
// import analyzeTicket from "../../utils/ai.js";
// import { sendEmail } from "../../utils/mailer.js";

// export const onticketCreate = inngest.createFunction(
// { id: "on-ticket-create", retries: 2 },
// { event: "ticket/created" },

// async ({ event, step }) => {
//   try {
//     const { ticketId } = event.data;

//     const ticket = await step.run("Fetch Ticket", async () => {
//       const ticketObject = await Ticket.findById(ticketId);
//       if (!ticketObject) {
//         throw new NonRetriableError("Ticket not found");
//       }
//       return ticketObject;
//     });

//     await step.run("update-ticket-status", async () => {
//       await Ticket.findByIdAndUpdate(ticket._id, { status: "in-progress" });
//     });

//     // const airesponse = await analyzeTicket(ticket);

//       const airesponse = await step.run("analyze-ticket-with-ai", async () => {
//       console.log("Starting AI analysis...");
//       const analysis = await analyzeTicket(ticket);
//       console.log("AI Analysis result:", analysis);
//       return analysis;
//     });


//     const updateTicket = await step.run("update-ticket", async () => {
//       let skills = [];
//       if (airesponse) {
//         await Ticket.findByIdAndUpdate(ticket._id, {
//           priority: !["low", "medium", "high"].includes(airesponse.priority)
//             ? "medium"
//             : airesponse.priority,
//           helpfulNotes: airesponse.helpfulNotes,
//           status: airesponse.status,
//           relatedSkills: airesponse.relatedSkills,
//         });
//         skills = airesponse.relatedSkills || [];
//         console.log("Ticket updated with AI analysis. Skills needed:", skills);
//       }
//       return skills;
//     });

//     const moderator = await step.run("assign-moderator", async () => {
//       let user = await User.findOne({
//         role: "moderator",
//         skills: {
//           $elemMatch: {
//             $regex: relatedskills.join("|"),
//             $options: "i",
//           },
//         },
//       });
//       if (!user) {
//         user = await User.findOne({
//           role: "admin",
//         });
//       }
//       await Ticket.findByIdAndUpdate(ticket._id, {
//         assignedTo: user?._id || null,
//       });
//       return user;
//     });

//   await step.run("notify-moderator" , async () => {
//       if(moderator){
//           const finalTicket = await Ticket.findById(ticketId._id);
//           await sendEmail(
//           moderator.email,
//           "Ticket Assigned",
//           `A new ticket is assigned to you ${finalTicket.title}`
//           );
//       }
//   })

//     return { 
//       success: true, 
//       ticketId: ticket._id,
//       assignedTo: moderator?.userName,
//       priority: airesponse?.priority,
//       relatedSkills: airesponse?.relatedSkills
      
//     };

//   } catch (err) {
//     console.error("Error processing ticket creation:", err.message);
//     return {success: false}
//   }
// }
// );

import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import analyzeTicket from "../../utils/ai.js";
import { sendEmail } from "../../utils/mailer.js";

export const onticketCreate = inngest.createFunction(
  { id: "on-ticket-create", retries: 2 },
  { event: "ticket/created" },

  async ({ event, step }) => {
    console.log("🚀 Inngest function triggered with event:", event.data);
    
    try {
      const { ticketId } = event.data;
      console.log("📋 Processing ticket ID:", ticketId);

      // Step 1: Fetch the ticket
      const ticket = await step.run("fetch-ticket", async () => {
        console.log("🔍 Fetching ticket from database...");
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          console.error("❌ Ticket not found:", ticketId);
          throw new NonRetriableError("Ticket not found");
        }
        console.log("✅ Ticket found:", ticketObject.title);
        return ticketObject;
      });

      // Step 2: Update ticket status to in-progress
      await step.run("update-ticket-status", async () => {
        console.log("📝 Updating ticket status to in-progress...");
        const updated = await Ticket.findByIdAndUpdate(
          ticket._id, 
          { status: "in-progress" },
          { new: true }
        );
        console.log("✅ Ticket status updated:", updated.status);
        return updated;
      });

      // Step 3: AI Analysis (with fallback)
      const aiResponse = await step.run("analyze-ticket-with-ai", async () => {
        console.log("🤖 Starting AI analysis...");
        try {
          const analysis = await analyzeTicket(ticket);
          console.log("✅ AI Analysis completed:", {
            priority: analysis?.priority,
            skillsCount: analysis?.relatedSkills?.length || 0
          });
          return analysis;
        } catch (error) {
          console.error("❌ AI analysis failed:", error.message);
          // Return fallback analysis instead of null
          return {
            priority: "medium",
            helpfulNotes: `AI analysis failed. Manual review required for: ${ticket.description}. Error: ${error.message}`,
            status: "open",
            relatedSkills: ["General Support"],
            category: "technical"
          };
        }
      });

      // Step 4: Update ticket with AI analysis
      const relatedSkills = await step.run("update-ticket-with-ai", async () => {
        console.log("📝 Updating ticket with AI analysis results...");
        
        const updateData = {
          priority: ["low", "medium", "high"].includes(aiResponse?.priority) 
            ? aiResponse.priority 
            : "medium",
          helpfulNotes: aiResponse?.helpfulNotes || "AI analysis not available",
          status: aiResponse?.status || "open",
          relatedSkills: Array.isArray(aiResponse?.relatedSkills) 
            ? aiResponse.relatedSkills 
            : ["General Support"]
        };

        console.log("📝 Update data:", updateData);

        const updatedTicket = await Ticket.findByIdAndUpdate(
          ticket._id,
          updateData,
          { new: true }
        );

        console.log("✅ Ticket updated successfully:", {
          id: updatedTicket._id,
          priority: updatedTicket.priority,
          status: updatedTicket.status,
          skills: updatedTicket.relatedSkills
        });

        return updatedTicket.relatedSkills || [];
      });

      // Step 5: Find and assign moderator
      const moderator = await step.run("assign-moderator", async () => {
        console.log("👤 Looking for moderator to assign...");
        console.log("🔍 Required skills:", relatedSkills);
        
        let user = null;

        // First, try to find a moderator with matching skills
        if (relatedSkills && relatedSkills.length > 0) {
          console.log("🔍 Searching for moderator with matching skills...");
          
          try {
            user = await User.findOne({
              role: "moderator",
              skills: {
                $elemMatch: {
                  $regex: relatedSkills.join("|"),
                  $options: "i",
                },
              },
            });
            
            if (user) {
              console.log("✅ Found moderator with matching skills:", user.userName);
            }
          } catch (skillSearchError) {
            console.error("❌ Error searching for skilled moderator:", skillSearchError);
          }
        }

        // Fallback: Find any moderator
        if (!user) {
          console.log("🔍 Searching for any available moderator...");
          user = await User.findOne({ role: "moderator" });
          if (user) {
            console.log("✅ Found fallback moderator:", user.userName);
          }
        }

        // Final fallback: Find admin
        if (!user) {
          console.log("🔍 Searching for admin as final fallback...");
          user = await User.findOne({ role: "admin" });
          if (user) {
            console.log("✅ Found admin as fallback:", user.userName);
          }
        }

        if (!user) {
          console.error("❌ No moderator or admin found!");
          return null;
        }

        // Assign the ticket
        console.log("📝 Assigning ticket to:", user.userName);
        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user._id,
        });

        console.log("✅ Ticket assigned successfully");
        return user;
      });

      // Step 6: Send notification email
      await step.run("notify-moderator", async () => {
        if (moderator) {
          console.log("📧 Sending notification email to:", moderator.email);
          
          try {
            const finalTicket = await Ticket.findById(ticket._id);
            const emailSubject = `New Ticket Assigned: ${finalTicket.title}`;
            const emailBody = `Hello ${moderator.userName},

A new support ticket has been assigned to you:

Title: ${finalTicket.title}
Description: ${finalTicket.description}
Priority: ${finalTicket.priority}
Skills Required: ${finalTicket.relatedSkills?.join(", ") || "General Support"}

Helpful Notes:
${finalTicket.helpfulNotes}

Please login to the system to view and handle this ticket.

Best regards,
Support System`;

            await sendEmail(moderator.email, emailSubject, emailBody);
            console.log("✅ Notification email sent successfully");
          } catch (emailError) {
            console.error("❌ Failed to send notification email:", emailError.message);
            // Don't throw error, just log it
          }
        } else {
          console.log("⚠️ No moderator found, skipping email notification");
        }
      });

      const result = {
        success: true,
        ticketId: ticket._id,
        assignedTo: moderator?.userName || null,
        assignedToEmail: moderator?.email || null,
        priority: aiResponse?.priority || "medium",
        relatedSkills: relatedSkills,
        aiAnalysisSuccess: !!aiResponse,
        moderatorFound: !!moderator
      };

      console.log("🎉 Inngest function completed successfully:", result);
      return result;

    } catch (error) {
      console.error("❌ Inngest function failed:", error.message);
      console.error("📋 Error stack:", error.stack);
      
      // Try to update ticket status to indicate failure
      try {
        await Ticket.findByIdAndUpdate(event.data.ticketId, {
          status: "open",
          helpfulNotes: `Processing failed: ${error.message}. Manual review required.`
        });
      } catch (updateError) {
        console.error("❌ Failed to update ticket after error:", updateError.message);
      }

      return { 
        success: false, 
        error: error.message,
        ticketId: event.data.ticketId
      };
    }
  }
);
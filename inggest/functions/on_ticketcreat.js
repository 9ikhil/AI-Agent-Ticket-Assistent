import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import analyzeTicket from "../../utils/ai.js";

export const onticketCreate = inngest.createFunction(
  { id: "on-ticket-create", retries: 2 },
  { event: "ticket/created" },

  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      const ticket = await step.run("Fetch Ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const airesponse = await analyzeTicket(ticket);

      const updateTicket = await step.run("update-ticket", async () => {
        let skills = [];
        if (airesponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(airesponse.priority)
              ? "medium"
              : airesponse.priority,
            helpfulNotes: airesponse.helpfulNotes,
            status: airesponse.status,
            relatedSkills: airesponse.relatedSkills,
          });
          skills = airesponse.relatedSkills;
        }
        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedskills.join("|"),
              $options: "i",
            },
          },
        });
        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }
        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });
        return user;
      });

    await step.run("notify-moderator" , async () => {
        if(moderator){
            const finalTicket = await Ticket.findById(ticketId._id);
            await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket is assigned to you ${finalTicket.title}`
            );
        }
    })

    return {success: true};

    } catch (err) {
      console.error("Error processing ticket creation:", err.message);
      return {success: false}
    }
  }
);

// {import { inngest } from "../inggest/client.js";
// import Ticket from "../models/ticket.js";

// export const createTicket = async (req, res) => {
//   try {
//     const { title, description } = req.body;
//     if (!title || !description) {
//       return res
//         .status(400)
//         .json({ error: "Title and description are required" });
//     }

//     const newTicket = await Ticket.create({
//       name: "ticket/created",
//       title,
//       description,
//       createdBy: req.user._id.toString(),
//     });

//     await inngest.send({
//       name: "ticket/created",
//       data: {
//         ticketId:  newTicket._id.toString(),
//         title,
//         description,
//         createdBy: req.user._id.toString(),
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Ticket created successfully and processing",
//       ticket: newTicket,
//     });
//   } catch (error) {
//     console.error("Error creating ticket:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getTickets = async (req, res) => {
//   try {
//     const user = req.user;
//     let tickets;
//     if (user.role !== "user") {
//       tickets = await Ticket.find({})
//         .populate("createdBy", ["email", "_id"])
//         .sort({ createdAt: -1 });
//     } else {
//       tickets = Ticket.find({ createdBy: user._id })
//         .select(" title description status priority createdAt ")
//         .sort({ createdAt: -1 });
//     }

//     return res.status(200).json(tickets);
//   } catch (error) {
//     console.error("Error fetching tickets:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const getTicket = async (req, res) => {
//   const user = req.user;
//   let ticket;
//   try {
//     if (user.role == "user") {
//       ticket = await Ticket.findById({ _id: req.params.id }).populate(
//         "userName",
//         "assignedTo",
//         ["email", "_id"]
//       );
//     } else {
//       ticket = await Ticket.findOne({
//         createdBy: user._id,
//         id: req.params.id,
//         userName: userName,
//       }).select("title description status createdAt");
//     }

//     return res.status(200).json(ticket);
//   } catch (error) {
//     console.error("Error fetching ticket:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
// }

import { inngest } from "../inggest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully and processing",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    console.log("Getting tickets for user:", req.user._id); // Debug log
    
    const user = req.user;
    let tickets;
    
    // Validate user object
    if (!user || !user._id) {
      return res.status(401).json({ 
        error: "Invalid user data",
        details: "User information not found in request"
      });
    }
    
    if (user.role !== "user") {
      console.log("Fetching all tickets for admin/moderator");
      // Admin/Moderator can see all tickets
      tickets = await Ticket.find({})
        .populate("createdBy", "email _id userName")
        .populate("assignedTo", "email _id userName")
        .sort({ createdAt: -1 })
        .lean(); // Use lean() to get plain JavaScript objects
    } else {
      console.log("Fetching tickets for user:", user._id);
      // Regular users can only see their own tickets
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status priority createdAt helpfulNotes")
        .sort({ createdAt: -1 })
        .lean(); // Use lean() to get plain JavaScript objects
    }

    console.log(`Found ${tickets.length} tickets`);

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid ticket ID format" });
    }

    if (user.role !== "user") {
      // Admin/Moderator can see any ticket
      ticket = await Ticket.findById(req.params.id)
        .populate("createdBy", "email _id userName")
        .populate("assignedTo", "email _id userName")
        .lean(); // Use lean() to get plain JavaScript objects
    } else {
      // Regular users can only see their own tickets
      ticket = await Ticket.findOne({
        _id: req.params.id,
        createdBy: user._id,
      })
      .select("title description status priority createdAt helpfulNotes relatedSkills")
      .lean(); // Use lean() to get plain JavaScript objects
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error("Error fetching ticket:", error.message);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};

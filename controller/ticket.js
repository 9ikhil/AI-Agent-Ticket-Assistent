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
      name: "ticket/created",
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: (await newTicket)._id.toString(),
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
    const user = req.user;
    let tickets;
    if (user.role !== "user") {
      tickets = Ticket.find({})
        .populate("createdBy", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = Ticket.find({ createdBy: user._id })
        .select(" title description status priority createdAt ")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTicket = async (req, res) => {
  const user = req.body;
  let ticket;
  try {
    if (user.role == "user") {
      ticket = await Ticket.findById({ _id: req.params.id }).populate(
        "userName",
        "assignedTo",
        ["email", "_id"]
      );
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        id: req.params.id,
        userName: userName,
      }).select("title description status createdAt");
    }

    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

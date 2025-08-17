import express from "express";
import { authentication } from "../middleware/auth.js";
import { createTicket, getTicket, getTickets , updateTicketStatus, assignTicket } from "../controller/ticket.js";

const router = express.Router();

router.get("/", authentication, getTickets);
router.get("/:id", authentication, getTicket);
router.post("/", authentication, createTicket);

// Update ticket status (admin/moderator only)
router.put("/:id/status", authentication, updateTicketStatus);

// Assign ticket to user (admin only)
router.put("/:id/assign", authentication, assignTicket);

export default router;
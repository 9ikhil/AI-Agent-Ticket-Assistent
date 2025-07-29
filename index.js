import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import {inngest} from "./inggest/client.js";
import { onUserSingup } from "./inggest/functions/on_signup.js";
import { onticketCreate } from "./inggest/functions/on_ticketcreat.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth' , userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use(
  "/inngest",
  serve({
    client : inngest,
    functions: [onUserSingup, onticketCreate],
  })
);




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log("🚀 Server at http://localhost:3000"));
  })
  .catch((err) => console.error("❌ MongoDB error: ", err));
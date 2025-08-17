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
const PORT = process.env.PORT || 6000;
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth' , userRoutes);
app.use('/api/tickets', ticketRoutes);


console.log("🔧 Setting up Inngest endpoint...");
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSingup, onticketCreate],
    logLevel: "info", // Add logging
    streaming: false, // Disable streaming for debugging
  })
);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    inngestEndpoint: '/inngest'
  });
});




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log("🚀 Server at http://localhost:5000"));
  })
  .catch((err) => console.error("❌ MongoDB error: ", err));
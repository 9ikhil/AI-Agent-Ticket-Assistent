<<<<<<< HEAD
=======
<<<<<<< HEAD:index.js
>>>>>>> 86577d9 (initial commit backend/frontend)
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
<<<<<<< HEAD
  .catch((err) => console.error("❌ MongoDB error: ", err));
=======
  .catch((err) => console.error("❌ MongoDB error: ", err));
=======
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { serve } from "inngest/express";
import userRoutes from "./routes/user.js";
import ticketRoutes from "./routes/ticket.js";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: "http://localhost:3000", // React dev server port
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log("🚀 Server at http://localhost:5000"));
  })
  .catch((err) => console.error("❌ MongoDB error: ", err));
>>>>>>> 784a12e (frontend development):ai-ticket-assistant/index.js
>>>>>>> 86577d9 (initial commit backend/frontend)

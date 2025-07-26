import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB✅");
    app.listen(process.env.PORT, () => (
        console.log('🚀Server is running at http://localhost:3000')
    ))
  })
  .catch((err) => console.error("❌MongoDB connection error:", err));

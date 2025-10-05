// backend/src/index.ts

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import "dotenv/config"; // Loads environment variables from .env file
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(cors()); // Enables CORS for all routes

// Test database connection (only connect, don't disconnect immediately)
async function connectDB() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");
  } catch (e) {
    console.error("❌ Database connection failed:", e);
    process.exit(1);
  }
}
connectDB();

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to the Sports Scheduler Backend!");
});

// Routes
app.use("/api/auth", authRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

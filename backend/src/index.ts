import "dotenv/config";

import express from "express";
import type { Request, Response } from "express";
import { AIService } from "./services/AI Generation/geminiGenerator";
import prisma from "./config/pdDB.js";
import dotenv from "dotenv";
import ClerkRouter from "./webhooks/clerk/clerk.routes";
import cors from "cors";

import { GoogleGenerativeAI } from "@google/generative-ai";

import CandidateRouter from "./services/candidate/candidate.router";
import ExaminerRouter from "./services/examiner/examiner.router";

import { createServer } from "http"; // 🏁 Added
import { Server } from "socket.io"; // 🏁 Added

const aiService = new AIService();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000", // Allow your Next.js app
    credentials: true, // Required for cookies/authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // Allow Clerk tokens
  }),
);

app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  ClerkRouter,
);

app.use(express.json());

// 🏁 FIX: Socket.io setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", credentials: true },
});

app.post("/generate-questions", async (req: Request, res: Response) => {
  const { content, mode } = req.body;

  // 1. Validation to prevent the Syntax/Body error
  if (!content || !mode) {
    return res
      .status(400)
      .json({ error: "Missing content or mode in request body" });
  }

  try {
    const questions = await aiService.generateQuestions(content, mode);
    // 2. Return the questions as an array
    return res.json({ success: true, data: questions });
  } catch (error: any) {
    console.error("AI Error:", error);
    return res.status(500).json({
      success: false,
      error: "AI failed to generate content. Check console for details.",
    });
  }
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    // '$queryRaw' executes a low-level SQL query.
    // 'SELECT 1' is the standard way to ping a database.
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check failed:", error.message);
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

/* app.post("/generate-email", async (req: Request, res: Response) => {
  const { timing, syllabus, subject } = req.body;
  try {
    const emailBody = await aiService.generateExamEmail({
      timing,
      syllabus,
      subject,
    });
    res.json({ success: true, emailBody });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate email" });
  }
}); */

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello world" });
});

app.use("/api/candidate", CandidateRouter);
app.use("/api/examiner", ExaminerRouter);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

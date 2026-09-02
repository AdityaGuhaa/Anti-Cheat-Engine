import type { Request, Response } from "express";

import { CandidateRepository } from "./candidate.repository";
const candidateRepo = new CandidateRepository();
import prisma from "../../config/pdDB";

export const getCandidateDashboardDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const clerkId = req.auth.userId;

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized user" });
      return;
    }

    const submission = await candidateRepo.getDashboardDetailsById(clerkId);

    const totalExams = submission.length;

    const avgScore =
      totalExams > 0
        ? submission.reduce((sum, sub) => sum + (sub.score || 0), 0) /
          totalExams
        : 0;

    const avgTruthScore =
      totalExams > 0
        ? submission.reduce((sum, sub) => sum + (sub.truthScore || 0), 0) /
          totalExams
        : 0;

    const achievements = [];
    if (avgScore >= 90) {
      achievements.push({
        title: "Top Performer",
        icon: "trophy",
        color: "text-yellow-500",
      });
    } else if (avgScore >= 80) {
      achievements.push({
        title: "Super Performer",
        icon: "medal",
        color: "text-gray-400",
      });
    } else if (avgScore >= 70) {
      achievements.push({
        title: "Top 30%",
        icon: "medal",
        color: "text-orange-500",
      });
    }

    if (avgTruthScore > 94)
      achievements.push({
        title: "Super Integrity",
        icon: "badge",
        color: "text-yellow-500",
      });
    else if (avgTruthScore > 89)
      achievements.push({
        title: "High Integrity",
        icon: "badge",
        color: "text-gray-400",
      });
    else if (avgTruthScore >= 80)
      achievements.push({
        title: "Dose not cheat",
        icon: "badge",
        color: "text-orange-500",
      });

    if (totalExams >= 5)
      achievements.push({ title: "Dedicated Learner", icon: "book" });

    res.status(200).json({
      stats: {
        totalExams,
        avgScore: Math.round(avgScore),
        avgTruthScore: Math.round(avgTruthScore),
      },
      achievements: achievements,
      history: submission.map((sub) => ({
        examTitle: sub.exam.title,
        date: sub.createdAt,
        score: sub.score,
        truthScore: sub.truthScore,
      })),
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

export const getPastExams = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const pastExam = await candidateRepo.getPastExamDetailsById(clerkId);

    res.status(200).json(
      pastExam.map((sub) => ({
        examId: sub.exam.id,
        examTitle: sub.exam.title,
        completedAt: sub.createdAt,
        score: sub.score,
        truthScore: sub.truthScore,
        status: sub.status,
      })),
    );
  } catch (error) {
    console.error("Error fetching past exams:", error);
    res.status(500).json({ message: "Failed to fetch past exams" });
  }
};

export const getUpcomingExams = async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth.userId;
    const exams = await candidateRepo.getUpcomingExamDetailsById(clerkId);
    console.log(exams);
    // 🏁 CRITICAL: Wrap it in the 'exams' key for the frontend
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ exams: [] }); // Fallback to empty array
  }
};

export const startExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkId = req.auth.userId;
    const { examId } = req.body;

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!examId) {
      res.status(400).json({ message: "Exam ID is required" });
      return;
    }

    const submission = await candidateRepo.startExam(clerkId, examId);

    res.status(200).json({
      message: "Exam session started",
      submissionId: submission.id,
      questions: submission.exam.questions, // Send the questions to the UI
    });
  } catch (error) {
    console.error("Start Exam Error:", error);
    res.status(500).json({ message: "Failed to start exam" });
  }
};

export const logProctoringEvent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { submissionId, type, severity, evidenceUrl } = req.body;

    if (!submissionId || !type) {
      res.status(400).json({ message: "Missing event details" });
      return;
    }

    const event = await candidateRepo.addProctoringEvent(submissionId, {
      type,
      severity: severity || "LOW",
      evidenceUrl,
    });

    res.status(200).json({ message: "Event logged", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to log event" });
  }
};

// candidate.controller.ts

export const submitExam = async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  const { answers } = req.body;
  const clerkId = req.auth.userId;

  try {
    const internalUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!internalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: { examId, candidateId: internalUser.id, status: "IN_PROGRESS" },
    });

    if (!existingSubmission) {
      return res.status(404).json({ message: "No active exam session found" });
    }

    // 1. Grade technical answers
    const questions = await prisma.question.findMany({
      where: { examId },
      select: { id: true, correctAnswer: true },
    });

    let correct = 0;
    questions.forEach((q) => {
      if (answers?.[q.id] === q.correctAnswer) correct++;
    });

    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;

    // 2. Fetch all proctoring events logged during this specific session
    const events = await prisma.proctoringEvent.findMany({
      where: { submissionId: existingSubmission.id },
    });

    // 3. Tally up the exact types of violations
    const eventCounts = {
      PHONE_DETECTED: 0,
      MULTIPLE_FACES: 0,
      BOOK_DETECTED: 0,
      LAPTOP_DETECTED: 0,
      SPEECH_DETECTED: 0,
      NO_FACE_DETECTED: 0,
      BACKGROUND_NOISE: 0,
    };

    events.forEach((e) => {
      // 1. Check if the string from the DB actually exists in our object
      if (e.type in eventCounts) {
        // 2. Now that TS knows it's safe, cast it to the exact key type
        const key = e.type as keyof typeof eventCounts;
        eventCounts[key]++;
      }
    });

    // 4. Smart Penalty Calculation (Weight * Count, up to a Max Cap)
    let penalty = 0;

    // Critical Violations (Heavy penalties, high caps)
    penalty += Math.min(eventCounts.PHONE_DETECTED * 20, 40); 
    penalty += Math.min(eventCounts.MULTIPLE_FACES * 15, 30); 
    penalty += Math.min(eventCounts.BOOK_DETECTED * 15, 30); 
    penalty += Math.min(eventCounts.LAPTOP_DETECTED * 15, 30); 

    // Warning Violations (Medium penalties, moderate caps)
    penalty += Math.min(eventCounts.SPEECH_DETECTED * 8, 20); 
    penalty += Math.min(eventCounts.NO_FACE_DETECTED * 5, 15); 

    // Minor Violations (Light penalties, strict caps)
    penalty += Math.min(eventCounts.BACKGROUND_NOISE * 0.5, 10); 

    // Calculate final Integrity score out of 100
    const truthScore = Math.max(0, 100 - penalty);

    // Assign Trust Label based on final Truth Score
    const trustLabel =
      truthScore >= 90 ? "HIGH" : truthScore >= 70 ? "MEDIUM" : "LOW";

    // 5. Commit everything to the database
    const submission = await prisma.submission.update({
      where: { id: existingSubmission.id },
      data: {
        status: "COMPLETED",
        score,
        truthScore,
        trustLabel,
        submittedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Submission successful",
      submissionId: submission.id,
      score,
      truthScore,
      trustLabel,
    });
  } catch (error) {
    console.error("Submission Error:", error);
    return res.status(500).json({ message: "Failed to process submission" });
  }
};

export const getExamDetails = async (req: Request, res: Response) => {
  try {
    const examId = req.params.id as string;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        _count: {
          select: { questions: true }
        }
      },
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    return res.status(200).json({
      ...exam,
      questionCount: exam._count.questions
    });
  } catch (error) {
    console.error("Fetch Exam Details Error:", error);
    return res.status(500).json({ message: "Failed to fetch exam details" });
  }
};
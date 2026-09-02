// examiner.controller.ts
import { type Request, type Response } from "express";
import { ExaminerRepository } from "./examiner.repository";
import prisma from "../../config/pdDB";
import { AccessType } from "../../generated/prisma/enums";

const examinerRepo = new ExaminerRepository();

// backend/src/services/examiner/examiner.controller.ts

// examiner.controller.ts
// examiner.controller.ts
export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      syllabus,
      duration,
      isProctored,
      accessType: rawAccessType,
      candidateEmails = [],
      questions = [],
    } = req.body;
    const accessType =
      ((rawAccessType as string)?.toUpperCase() as AccessType) ||
      AccessType.PUBLIC;

    const examiner = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      select: { id: true },
    });
    if (!examiner) return res.status(404).json({ error: "Examiner not found" });

    const sanitizedEmails = candidateEmails.map((email: string) =>
      email
        .trim()
        .replace(/^["'](.+)["']$/, "$1")
        .toLowerCase(),
    );

    // Now use 'sanitizedEmails' for everything else:
    const existingCandidates = await prisma.user.findMany({
      where: {
        email: { in: sanitizedEmails, mode: "insensitive" },
        role: "CANDIDATE",
      },
      select: { id: true },
    });

    const result = await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.create({
        data: {
          title,
          description: syllabus,
          duration: Number(duration) || 60,
          isProctored: isProctored ?? true,
          accessType,
          status: "PUBLISHED",
          creatorId: examiner.id,
          allowedCandidates: {
            connect: existingCandidates.map((u) => ({ id: u.id })),
          },
          questions: {
            create: questions.map((q: any) => ({
              text: q.text,
              type: (q.type as string)?.toUpperCase() ?? "MCQ",
              options: q.options ?? null,
              correctAnswer: q.correctAnswer ?? null,
              difficulty: (q.difficulty as string)?.toUpperCase() ?? "MEDIUM",
            })),
          },
        },
      });

      // Also create invites for record-keeping
      if (accessType === "PRIVATE" && candidateEmails.length > 0) {
        await tx.examInvite.createMany({
          data: candidateEmails.map((email: string) => ({
            examId: exam.id,
            email: email.toLowerCase().trim(),
            status: "PENDING",
          })),
          skipDuplicates: true,
        });
      }
      return exam;
    });

    return res.status(201).json({ success: true, exam: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getExaminerDashboard = async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) return res.status(401).json({ message: "Unauthorized" });

    const stats = await examinerRepo.getDashboardDetailsById(clerkId);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Failed to load examiner dashboard" });
  }
};

// examiner.controller.ts

export const getExamResults = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params as { examId: string };

    if (!examId) return res.status(400).json({ message: "Exam ID required" });

    const results = await examinerRepo.getExamSubmissions(examId);

    // Transform data for the frontend table
    const formattedResults = results.map((sub) => ({
      id: sub.id,
      candidateName: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
      score: sub.score,
      truthScore: sub.truthScore,
      trustLabel: sub.trustLabel,
      eventCount: sub.proctoringEvents.length,
      status: sub.status,
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

// Add this below your getExaminerDashboard function
export const getAllExaminerExams = async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth.userId;
    // Fetch exams created by this specific examiner
    const exams = await prisma.exam.findMany({
      where: { creator: { clerkId: clerkId } },
      include: {
        _count: { select: { submissions: true } },
        submissions: { select: { score: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const upcoming = exams.filter(e => e.status !== "ARCHIVED");
    const past = exams.filter(e => e.status === "ARCHIVED" || (e.endDate && new Date(e.endDate) < new Date()));

    res.status(200).json({ upcoming, past });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};
import { type Request, type Response } from "express";
import prisma from "../../config/pdDB"; // Adjust path to your Prisma client

export const getExamQuestions = async (req: Request, res: Response) => {
  const examId = req.params.id as string;
  try {
    // 1. Check if the exam exists and is PUBLISHED
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          take: 5, // Strictly limit to 5 for your project constraint
          select: {
            id: true,
            text: true,
            options: true, // This is your Json field
            type: true,
            difficulty: true,
          },
        },
      },
    });

    if (!exam || !("questions" in exam)) {
      return res.status(404).json({ message: "Exam not found" });
    }
    return res.status(200).json(exam.questions);
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

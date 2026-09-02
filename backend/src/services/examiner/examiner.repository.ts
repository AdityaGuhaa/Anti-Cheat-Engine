import prisma from "../../config/pdDB";
import { SubmissionStatus, ExamStatus } from "../../generated/prisma/enums";

export class ExaminerRepository {
  async getDashboardDetailsById(clerkId: string) {
    // FIX: Use creator: { clerkId } instead of creatorId: clerkId
    const [totalExams, activeExams, pendingReviews, stats, latestSubmissions] =
      await prisma.$transaction([
        prisma.exam.count({ where: { creator: { clerkId } } }),
        prisma.exam.count({
          where: { creator: { clerkId }, status: "PUBLISHED" },
        }),
        prisma.submission.count({
          where: { exam: { creator: { clerkId } }, status: "PENDING_REVIEW" },
        }),
        prisma.submission.aggregate({
          where: { exam: { creator: { clerkId } } },
          _avg: { truthScore: true },
        }),
        // Fetch real latest results for the dashboard
        prisma.submission.findMany({
          where: { exam: { creator: { clerkId } }, status: "COMPLETED" },
          include: { candidate: true, exam: true },
          orderBy: { submittedAt: "desc" },
          take: 4,
        }),
      ]);

    return {
      totalExams,
      activeExams,
      pendingReviews,
      averageIntegrity: Math.round(stats._avg.truthScore || 0),
      latestResults: latestSubmissions.map((sub) => ({
        name: `${sub.candidate.firstName} ${sub.candidate.lastName}`,
        role: sub.exam.title,
        score: Math.round(sub.score || 0),
        date: sub.submittedAt
          ? new Date(sub.submittedAt).toLocaleDateString()
          : "Just now",
      })),
    };
  }

  async createFullExam(data: any, questions: any[]) {
    return await prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        duration: parseInt(data.duration),
        creatorId: data.creatorId,
        status: "PUBLISHED",
        questions: {
          create: questions.map((q) => ({
            text: q.text, // Now TypeScript knows 'q' is an object!
            options: q.options, // Maps directly to your Json field
            correctAnswer: q.correctAnswer,
            type: "MCQ",
            difficulty: data.mode.toUpperCase(),
          })),
        },
      }, // This brace was missing in your snippet
      include: { questions: true },
    });
  }
  // examiner.repository.ts

  async getExamSubmissions(examId: string) {
    return await prisma.submission.findMany({
      where: { examId },
      include: {
        candidate: {
          select: { firstName: true, lastName: true, email: true },
        },
        proctoringEvents: true, // This shows the "evidence" of cheating
      },
      orderBy: { truthScore: "asc" }, // Show suspicious candidates first
    });
  }
}

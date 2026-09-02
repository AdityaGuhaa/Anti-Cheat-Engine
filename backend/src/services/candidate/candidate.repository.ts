import prisma from "../../config/pdDB";

export class CandidateRepository {
  async getDashboardDetailsById(clerkId: string) {
    return await prisma.submission.findMany({
      where: { candidate: { clerkId } },
      select: {
        score: true,
        truthScore: true,
        createdAt: true,
        exam: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPastExamDetailsById(clerkId: string) {
    return await prisma.submission.findMany({
      where: { candidate: { clerkId } }, // 👈 Use relation here
      select: {
        score: true,
        truthScore: true,
        createdAt: true,
        status: true,
        exam: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUpcomingExamDetailsById(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true },
    });

    if (!user) {
      console.log("❌ DEBUG: User not found in DB for clerkId:", clerkId);
      return [];
    }

    console.log("👤 DEBUG: Resolved User:", user.id, "| Email:", user.email);

    // STEP 1: Check how many exams are actually PUBLISHED
    const publishedExams = await prisma.exam.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true },
    });
    console.log(
      `📊 DEBUG: Total Published Exams in DB: ${publishedExams.length}`,
    );

    // STEP 2: Check how many exams this user is invited to
    const invitedExams = await prisma.exam.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { accessType: "PUBLIC" },
          { invites: { some: { email: user.email.toLowerCase().trim() } } },
          { allowedCandidates: { some: { id: user.id } } },
        ],
      },
      select: { id: true, title: true },
    });
    console.log(`📩 DEBUG: Exams user is ELIGIBLE for: ${invitedExams.length}`);

    // STEP 3: Check if the user has ALREADY submitted these exams
    const alreadySubmitted = await prisma.submission.findMany({
      where: { candidateId: user.id },
      select: { examId: true, status: true },
    });
    console.log(
      `🚫 DEBUG: User has existing submissions for Exam IDs:`,
      alreadySubmitted,
    );

    // FINAL QUERY
    const finalData = await prisma.exam.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { accessType: "PUBLIC" },
          { invites: { some: { email: user.email.toLowerCase().trim() } } },
          { allowedCandidates: { some: { id: user.id } } },
        ],
        submissions: {
          none: { candidateId: user.id }, // 👈 If the ID is in 'alreadySubmitted', this kills the result
        },
      },
      select: { id: true, title: true, description: true },
    });

    console.log(`🏁 DEBUG: Final Result Count: ${finalData.length}`);
    return finalData;
  }

  async startExam(clerkId: string, examId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error("User not found");

    // 1. Check if the user ALREADY has an active session for this exam
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        candidateId: user.id,
        examId: examId,
        status: "IN_PROGRESS", // They already started but haven't submitted
      },
      include: { exam: { include: { questions: true } } },
    });

    // 2. If they do, just return the existing session so they can resume!
    if (existingSubmission) {
      return existingSubmission;
    }

    // 3. Otherwise, create a brand new session
    return await prisma.submission.create({
      data: {
        candidateId: user.id,
        examId: examId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      include: { exam: { include: { questions: true } } },
    });
  }

  async addProctoringEvent(submissionId: string, eventData: any) {
    return await prisma.proctoringEvent.create({
      data: {
        submissionId,
        type: eventData.type,
        severity: eventData.severity,
        evidenceUrl: eventData.evidenceUrl,
      },
    });
  }

  async submitExamAnswers(submissionId: string, answers: any[]) {
    return await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: "COMPLETED",
        submittedAt: new Date(),
        answers: {
          create: answers.map((ans) => ({
            questionId: ans.questionId,
            value: ans.value,
          })),
        },
      },
    });
  }

  async evaluateSubmission(submissionId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch submission with its answers AND their related questions directly
      const submission = await tx.submission.findUnique({
        where: { id: submissionId },
        include: {
          proctoringEvents: true,
          answers: {
            include: {
              question: true, // This is now possible thanks to the schema update
            },
          },
        },
      });

      if (!submission) throw new Error("Submission not found");

      // 2. Technical Score Calculation
      let correctCount = 0;
      const totalQuestions = submission.answers.length;

      for (const ans of submission.answers) {
        if (ans.question && ans.value) {
          // Direct access to the correct answer via the relation
          const isCorrect =
            ans.value.trim().toLowerCase() ===
            ans.question.correctAnswer?.trim().toLowerCase();

          if (isCorrect) correctCount++;

          // Update the specific answer record with the result
          await tx.answer.update({
            where: { id: ans.id },
            data: { isCorrect: isCorrect },
          });
        }
      }

      const finalScore =
        totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

      // 3. Truth Score (Integrity) Calculation
      let penalty = 0;
      submission.proctoringEvents.forEach((event) => {
        if (event.severity === "HIGH") penalty += 20;
        else penalty += 5;
      });

      const truthScore = Math.max(0, 100 - penalty);

      let trustLabel = "HIGH";
      if (truthScore < 70) trustLabel = "LOW";
      else if (truthScore < 90) trustLabel = "MEDIUM";

      // 4. Update the Submission with final metrics
      return await tx.submission.update({
        where: { id: submissionId },
        data: {
          score: finalScore,
          truthScore: truthScore,
          trustLabel: trustLabel,
          status: truthScore < 70 ? "PENDING_REVIEW" : "COMPLETED",
          submittedAt: new Date(),
        },
      });
    });
  }
}

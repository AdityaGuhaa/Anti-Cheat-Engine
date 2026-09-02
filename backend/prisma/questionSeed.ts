import prisma from "../src/config/pdDB";

async function main() {
  // 1. Fetch the necessary users
  const examiner = await prisma.user.findFirst({
    where: { role: "EXAMINER" },
  });

  const candidates = await prisma.user.findMany({
    where: { role: "CANDIDATE" },
    take: 2, // Ensures we get exactly two
  });

  if (!examiner || candidates.length < 2) {
    console.log(
      "❌ Missing users. Ensure you have 1 EXAMINER and at least 2 CANDIDATES in the DB.",
    );
    return;
  }

  console.log("✅ Examiner Found:", examiner.email);
  candidates.forEach((c) => console.log("✅ Candidate Found:", c.email));

  // 2. Create a "Universal" Exam for both candidates
  const exam = await prisma.exam.create({
    data: {
      title: "Full Stack & AI Core",
      description:
        "Testing proctoring triggers: Person detection, Phone detection, and Speech.",
      duration: 15,
      isProctored: true,
      accessType: "PRIVATE",
      status: "PUBLISHED",
      creatorId: examiner.id,
      // 1. Authorization: Gives the users permission to join
      allowedCandidates: {
        connect: candidates.map((c) => ({ id: c.id })),
      },
      // 2. 🏁 FIX: Explicitly create the Invite records
      invites: {
        create: candidates.map((c) => ({
          email: c.email.toLowerCase().trim(),
          status: "PENDING", // Ensure this matches your Prisma Enum (likely PENDING or INVITED)
        })),
      },
      questions: {
        create: [
          {
            text: "Which protocol is used for real-time WebSocket communication?",
            type: "MCQ",
            options: JSON.stringify(["HTTP", "WS", "FTP", "SMTP"]),
            correctAnswer: "WS",
            difficulty: "EASY",
          },
          {
            text: "In YOLOv8, what does the 'confidence threshold' primarily control?",
            type: "MCQ",
            options: JSON.stringify([
              "Speed",
              "Box size",
              "Detection sensitivity",
              "Image resolution",
            ]),
            correctAnswer: "Detection sensitivity",
            difficulty: "MEDIUM",
          },
          {
            text: "What is the primary purpose of a Redis 'BRPOP' operation?",
            type: "MCQ",
            options: JSON.stringify([
              "Delete a key",
              "Blocking pop from list",
              "Publish a message",
              "Set a timeout",
            ]),
            correctAnswer: "Blocking pop from list",
            difficulty: "HARD",
          },
          {
            text: "Which Clerk hook is used to retrieve a session token for API calls?",
            type: "MCQ",
            options: JSON.stringify([
              "useUser()",
              "useAuth()",
              "useSession()",
              "useToken()",
            ]),
            correctAnswer: "useAuth()",
            difficulty: "MEDIUM",
          },
          {
            text: "In a Next.js 16 (Turbopack) project, where should environment variables be stored?",
            type: "MCQ",
            options: JSON.stringify([
              ".env.local",
              ".config",
              "package.json",
              "next.config.js",
            ]),
            correctAnswer: ".env.local",
            difficulty: "EASY",
          },
        ],
      },
    },
  });

  console.log("---");
  console.log("🚀 SEED SUCCESSFUL");
  console.log("Exam ID:", exam.id);
  console.log("Both candidates are now authorized for this exam.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

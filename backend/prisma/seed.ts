// backend/prisma/seed.ts
import "dotenv/config";
import prisma from "../src/config/pdDB"; // 👈 Update this path to where your index.ts/db.ts is
import { createClerkClient } from "@clerk/clerk-sdk-node";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! || "sk_test_2vomvW5R4RB8b51xy2CYD8MJo54R4eNsujHQfufyAf" });

async function main() {
  console.log("🔄 Syncing Clerk Users to PostgreSQL...");

  // 1. Get the users (TypeScript says this is already the array)
  const clerkUsers = await clerk.users.getUserList();

  // 2. Loop through clerkUsers directly (no .data)
  for (const cUser of clerkUsers) {
    const email = cUser.emailAddresses[0]?.emailAddress;
    const role =
      (cUser.publicMetadata.role as string)?.toUpperCase() || "CANDIDATE";

    console.log(`Processing: ${email} (${role})`);

    await prisma.user.upsert({
      where: { clerkId: cUser.id },
      update: {
        email,
        firstName: cUser.firstName || "",
        lastName: cUser.lastName || "",
        role: role as any,
      },
      create: {
        clerkId: cUser.id,
        email,
        firstName: cUser.firstName || "",
        lastName: cUser.lastName || "",
        role: role as any,
      },
    });
  }

  console.log("✅ Database is now in sync with Clerk!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Keep the disconnect here to clean up the process
    await prisma.$disconnect();
  });

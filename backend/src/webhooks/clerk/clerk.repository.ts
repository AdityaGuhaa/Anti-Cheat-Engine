import prisma from "../../config/pdDB";
import { UserRole } from "../../generated/prisma/enums";

export class ClerkRepository {
  async createUser(data: {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    role: string;
  }) {
    let safeRole: UserRole = UserRole.CANDIDATE;
    if (data.role?.toUpperCase() === "EXAMINER") safeRole = UserRole.EXAMINER;

    // Use a transaction to ensure both happen or neither happens
    return await prisma.$transaction(async (tx) => {
      // 1. Create the User
      const newUser = await tx.user.create({
        data: {
          clerkId: data.clerkId,
          email: data.email,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          avatarUrl: data.avatarUrl ?? null,
          role: safeRole,
        },
      });

      // 2. CHECK FOR PENDING INVITES (The Magic Step)
      // "Are there any exams waiting for this email?"
      const pendingInvites = await tx.examInvite.findMany({
        where: { email: data.email },
      });

      if (pendingInvites.length > 0) {
        console.log(
          `Found ${pendingInvites.length} pending invites for ${data.email}`,
        );

        // Connect this new user to all those exams
        for (const invite of pendingInvites) {
          await tx.exam.update({
            where: { id: invite.examId },
            data: {
              allowedCandidates: {
                connect: { id: newUser.id }, // Link the new user!
              },
            },
          });
        }

        // 3. Delete the used invites (Cleanup)
        await tx.examInvite.deleteMany({
          where: { email: data.email },
        });
      }

      return newUser;
    });
  }

  async updateUser(
    clerkId: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    },
  ) {
    return await prisma.user.update({
      where: { clerkId },
      data: {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        avatarUrl: data.avatarUrl ?? null,
      },
    });
  }

  async deleteUser(clerkId: string) {
    return await prisma.user.delete({
      where: { clerkId },
    });
  }
}

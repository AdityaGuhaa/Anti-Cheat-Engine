import prisma from "../../../config/pdDB";

export class UserInfoRepository {
  async findUserByIdForNavbar(clerkId: string) {
    return await prisma.user.findUnique({
      where: { clerkId },
      select: { clerkId: true, firstName: true, lastName: true,email: true, id: true },
    });
  }

  async findUserById(clerkId: string) {
    return await prisma.user.findUnique({
        where: {clerkId},
        omit: {
            updatedAt: true,
            createdAt: true,
            clerkId: true,
            id: true
        }
    })
  }

  async updateUserDetails(clerkId: string, data: {firstName?: string, lastName?: string, headline?: string, bio?: string, location?:string}){
    return await prisma.user.update({
      where: {clerkId},
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.headline !== undefined && { headline: data.headline }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
      }
    })
  }
}

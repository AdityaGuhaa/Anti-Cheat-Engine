import type { Request, Response, NextFunction, RequestHandler } from "express";
import {
  ClerkExpressRequireAuth,
  type StrictAuthProp,
  createClerkClient,
} from "@clerk/clerk-sdk-node";

// 1. Remove the top-level 'throw' error. 
// We will check for the key inside the functions instead.
const getClerkClient = () => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is missing from environment variables.");
  }
  return createClerkClient({ secretKey });
};

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

export const requireAuth = ClerkExpressRequireAuth() as unknown as RequestHandler;

export const requireRole = (requiredRole: "EXAMINER" | "CANDIDATE") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: No User ID found" });
      }

      // 2. Initialize the client only when the route is actually hit
      const clerkClient = getClerkClient();
      const user = await clerkClient.users.getUser(userId);
      const userRole = (user.publicMetadata.role as string)?.toUpperCase();

      if (userRole !== requiredRole) {
        return res.status(403).json({
          message: `Forbidden: Requires ${requiredRole} role. You are ${userRole}`,
        });
      }

      next();
    } catch (error) {
      console.error("Role verification error: ", error);
      res.status(500).json({ message: "Internal server error during AUTH" });
    }
  };
};
import type { Request, Response } from "express";
import { UserInfoRepository } from "./user.repository";

interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  location?: string;
}

const user = new UserInfoRepository();

export const getUserNavbarDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkId = req.auth.userId;

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userData = await user.findUserByIdForNavbar(clerkId);

    if (!user) {
      res.status(404).json({ message: "User dose not exist" });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Unable to fetch user navbar details: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkId = req.auth.userId;

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userData = await user.findUserById(clerkId);

    if (!user) {
      res.status(404).json({ message: "User dose not exist" });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Unable to fetch user navbar details: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const clerkId = req.auth.userId;

    if (!clerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { firstName, lastName, headline, bio, location } = req.body;

    const updateData: UpdateUserParams = {
      firstName,
      lastName,
      headline,
      bio,
      location,
    };

    // Call Repository
    const updatedUser = await user.updateUserDetails(clerkId, updateData);

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });

    
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user details" });
  }
};

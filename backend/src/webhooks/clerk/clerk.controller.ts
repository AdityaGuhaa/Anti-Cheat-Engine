import type { Request, Response } from "express";
import { Webhook } from "svix";
import { type WebhookEvent } from "@clerk/clerk-sdk-node";
import { ClerkRepository } from "./clerk.repository";
import { createClerkClient } from "@clerk/clerk-sdk-node";

const clerkRepo = new ClerkRepository();

export const handleClerkWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Missing Clerk_Webhook_Secret_Key");
    }

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix_timestamp"] as string;
    const svix_signature = req.headers["svix_signature"] as string;

    if (!svix_id || !svix_signature || !svix_timestamp) {
      res.status(400).send("Error: Missing svix headers");
    }

    const payload = (req.body as Buffer).toString();

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as WebhookEvent;
    } catch (err: any) {
      console.error("Error verifying webhook:", err.message);
      res.status(400).json({ success: false, message: err.message });
      return;
    }

    const eventType = evt.type;
    console.log(`Received Webhook with type: ${eventType}`);

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses[0]?.email_address;

      // 1. Force the role to CANDIDATE for all new signups
      const role = "CANDIDATE";

      if (email) {
        // 2. Save to your local Prisma DB
        await clerkRepo.createUser({
          clerkId: id,
          email,
          firstName: first_name,
          lastName: last_name,
          avatarUrl: image_url,
          role,
        });

        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY!,
        });

        // 3. IMPORTANT: Push the role BACK to Clerk's Metadata
        // This prevents 403 errors on the next login!
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            role: "CANDIDATE",
          },
        });

        console.log(`User ${id} created and role set to CANDIDATE in Clerk.`);
      }
    }

    if (eventType === "user.updated") {
      const { id, first_name, last_name, image_url } = evt.data;
      console.log(`User Updated: ${id}`);

      await clerkRepo.updateUser(id, {
        firstName: first_name,
        lastName: last_name,
        avatarUrl: image_url,
      });

      console.log(`User with id: ${id} UPDATED`);
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;
      console.log(`User Deleted: ${id}`);
      if (id) {
        await clerkRepo.deleteUser(id);
        console.log(`User with id: ${id} DELETED`);
      }
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

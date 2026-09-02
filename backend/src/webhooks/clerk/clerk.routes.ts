import { Router } from "express";
import bodyParser from "body-parser";
import { handleClerkWebhook } from "./clerk.controller";

const router = Router();

router.post("/", handleClerkWebhook);

export default router;

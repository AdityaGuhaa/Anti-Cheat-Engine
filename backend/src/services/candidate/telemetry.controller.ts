// backend/src/services/candidate/telemetry.controller.ts
import { type Request, type Response } from "express";
import { aiQueue } from "../../queues/aiQueue";
import multer from "multer";

// 1. Export upload so the Router can see it
const storage = multer.memoryStorage();
export const upload = multer({ storage }); 

// 2. Define local types to stop TypeScript from complaining
interface MulterFile {
  buffer: Buffer;
  size: number;
}

type RequestWithFiles = Request & {
  files?: { [fieldname: string]: MulterFile[] };
};

export const uploadTelemetry = async (req: Request, res: Response) => {
  try {
    const extendedReq = req as RequestWithFiles;
    const imageFile = extendedReq.files?.['image']?.[0];
    const audioFile = extendedReq.files?.['audio']?.[0];
    const { userId, examId } = req.body;

    if (!imageFile || !audioFile || !userId || !examId) {
      console.log("❌ Missing telemetry fields");
      return res.status(400).json({ message: "Missing data" });
    }

    // 🏁 CRITICAL: These keys MUST match your Python script exactly
    await aiQueue.add('analyze-frame', {
      userId,
      examId,
      image_base64: imageFile.buffer.toString('base64'),
      audio_base64: audioFile.buffer.toString('base64'),
      timestamp: Date.now()
    }, { 
      removeOnComplete: true, 
      removeOnFail: true,
      attempts: 1 
    });

    console.log(`📡 Queued: User ${userId}`);
    return res.status(202).json({ success: true });
  } catch (error) {
    console.error("🔥 Queue Error:", error);
    return res.status(500).send();
  }
};
// backend/src/queues/aiQueue.ts
import { Queue } from "bullmq";

// backend/src/queues/aiQueue.ts
export const aiQueue = new Queue("analyze-frame", {
  connection: {
    host: process.env.REDIS_URL || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    connectTimeout: 30000, // 30 seconds
    keepAlive: 10000,
    // If your Redis has no password, ensure this is correct
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
  },
});

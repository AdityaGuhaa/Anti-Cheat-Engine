import IORedis from "ioredis";

// This connects to the Redis server running on your laptop (localhost)
const redisConnection = new IORedis({
  host: process.env.REDIS_URL,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on("connect", () => console.log("✅ Connected to Redis"));
redisConnection.on("error", (err) => console.error("❌ Redis Error:", err));

export default redisConnection;

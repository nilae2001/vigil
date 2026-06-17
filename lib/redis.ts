import "dotenv/config";

// Upstash (and BullMQ in general) require maxRetriesPerRequest: null and
// enableReadyCheck: false on the connection used by both the Queue and the Worker.
export const redisConnection = {
  url: process.env.REDIS_URL!,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

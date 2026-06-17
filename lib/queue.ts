import "dotenv/config";
import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export const endpointQueue = new Queue("endpoint-checks", {
  connection: redisConnection,
});

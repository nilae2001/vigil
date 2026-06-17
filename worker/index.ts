import "dotenv/config";
import { Worker } from "bullmq";
import { db } from "../src";
import { endpoints } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { endpointQueue } from "../lib/queue";
import { redisConnection } from "../lib/redis";
import { checkEndpoint } from "./jobs/checkEndpoints";

async function start() {
  // start the worker first
  const worker = new Worker(
    "endpoint-checks",
    async (job) => {
      await checkEndpoint(job.data.endpointId);
    },
    {
      connection: redisConnection,
    },
  );

  // listeners
  worker.on("completed", (job) => {
    console.log(`Check completed for endpoint ${job.data.endpointId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Check failed for endpoint ${job?.data.endpointId}:`, err);
  });

  console.log("worker started");

  // get all endpoints
  const allEndpoints = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.is_active, true));

  // add endpoints to queue, repeating every interval
  for (const endpoint of allEndpoints) {
    await endpointQueue.add(
      `check-${endpoint.id}`,
      {
        endpointId: endpoint.id,
      },
      {
        repeat: {
          every: endpoint.interval_seconds * 1000,
        },
      },
    );
    console.log(`enqueued job for endpoint ${endpoint.id}`);
  }
}

start();

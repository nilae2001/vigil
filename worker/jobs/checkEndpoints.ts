import { db } from "../../src";
import { checks, endpoints, incidents } from "../../src/db/schema";
import { eq, desc, lt, and, isNull } from "drizzle-orm";
import { sendDownAlert, sendRecoveredAlert } from "../../lib/email";

export async function checkEndpoint(endpointId: number) {
  const [endpoint] = await db
    .select()
    .from(endpoints)
    .where(eq(endpoints.id, endpointId));
  if (!endpoint) return;

  const start = Date.now();
  let checkInsert;

  try {
    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      signal: AbortSignal.timeout(5000),
    });

    const responseTimeMs = Date.now() - start;
    const isUp = response.status === endpoint.expected_status;

    //Insert the check
    [checkInsert] = await db
      .insert(checks)
      .values({
        endpoint_id: endpoint.id,
        status_code: response.status,
        response_time: responseTimeMs,
        is_up: isUp,
        error_message: null,
      })
      .returning();
  } catch (error: any) {
    const responseTimeMs = Date.now() - start;
    const isTimeout =
      error.name === "TimeoutError" || error.message?.includes("timeout");

    // Insert the check (Failed Network/Timeout)
    [checkInsert] = await db
      .insert(checks)
      .values({
        endpoint_id: endpoint.id,
        status_code: isTimeout ? 408 : null,
        response_time: responseTimeMs,
        is_up: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .returning();
  }

  //UNIFIED INCIDENT LOGIC (Runs for both 400s and Network Errors)
  try {
    const [previousCheck] = await db
      .select({ isUp: checks.is_up })
      .from(checks)
      .where(
        and(eq(checks.endpoint_id, endpointId), lt(checks.id, checkInsert.id)),
      )
      .orderBy(desc(checks.id))
      .limit(1);

    const [openIncident] = await db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.endpoint_id, endpointId),
          isNull(incidents.resolved_at),
        ),
      )
      .limit(1);

    console.log(
      `Endpoint ${endpointId}: isUp=${checkInsert.is_up}, hasOpenIncident=${!!openIncident}`,
    );

    if (!checkInsert.is_up && !openIncident) {
      console.log(`Starting new incident for endpoint ${endpointId}`);
      const startedAt = new Date();
      await db.insert(incidents).values({
        endpoint_id: endpoint.id,
        started_at: startedAt,
        resolved_at: null,
      });
      await sendDownAlert(endpoint.name, endpoint.url, startedAt);
    } else if (checkInsert.is_up && openIncident) {
      console.log(`Resolving incident for endpoint ${endpointId}`);
      const resolvedAt = new Date();
      const durationSeconds = Math.floor(
        (resolvedAt.getTime() - openIncident.started_at!.getTime()) / 1000,
      );
      await db
        .update(incidents)
        .set({ resolved_at: resolvedAt, duration: durationSeconds })
        .where(eq(incidents.id, openIncident.id));
      await sendRecoveredAlert(endpoint.name, endpoint.url, durationSeconds);
    }
  } catch (err) {
    console.error("Incident Logic Error:", err);
  }
}

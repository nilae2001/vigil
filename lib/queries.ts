import { db } from "../src";
import { checks, endpoints } from "@/src/db/schema";
import { desc, sql, gt, eq, and, inArray } from "drizzle-orm";

export async function getDashboardData(userId: string) {
  const ownedEndpointIds = db
    .select({ id: endpoints.id })
    .from(endpoints)
    .where(eq(endpoints.user_id, userId));

  const [
    allEndpoints,
    latestCheckResults,
    stats24h,
    stats7d,
    stats30d,
    avgs,
    history,
  ] = await Promise.all([
    db.select().from(endpoints).where(eq(endpoints.user_id, userId)),
    db
      .selectDistinctOn([checks.endpoint_id], {
        id: checks.endpoint_id,
        isUp: checks.is_up,
        statusCode: checks.status_code,
      })
      .from(checks)
      .where(inArray(checks.endpoint_id, ownedEndpointIds))
      .orderBy(checks.endpoint_id, desc(checks.timestamp)),

    // Uptime % Calculations
    db
      .select({
        id: checks.endpoint_id,
        val: sql<number>`COALESCE(AVG(CASE WHEN ${checks.is_up} = true THEN 100.0 ELSE 0.0 END)::numeric, 0)`.mapWith(
          Number,
        ),
      })
      .from(checks)
      .where(
        and(
          gt(checks.timestamp, sql`now() - interval '24 hours'`),
          inArray(checks.endpoint_id, ownedEndpointIds),
        ),
      )
      .groupBy(checks.endpoint_id),
    db
      .select({
        id: checks.endpoint_id,
        val: sql<number>`COALESCE(AVG(CASE WHEN ${checks.is_up} = true THEN 100.0 ELSE 0.0 END)::numeric, 0)`.mapWith(
          Number,
        ),
      })
      .from(checks)
      .where(
        and(
          gt(checks.timestamp, sql`now() - interval '7 days'`),
          inArray(checks.endpoint_id, ownedEndpointIds),
        ),
      )
      .groupBy(checks.endpoint_id),
    db
      .select({
        id: checks.endpoint_id,
        val: sql<number>`COALESCE(AVG(CASE WHEN ${checks.is_up} = true THEN 100.0 ELSE 0.0 END)::numeric, 0)`.mapWith(
          Number,
        ),
      })
      .from(checks)
      .where(
        and(
          gt(checks.timestamp, sql`now() - interval '30 days'`),
          inArray(checks.endpoint_id, ownedEndpointIds),
        ),
      )
      .groupBy(checks.endpoint_id),

    // Average Latency
    db
      .select({
        id: checks.endpoint_id,
        val: sql<number>`COALESCE(AVG(${checks.response_time})::numeric, 0)`.mapWith(
          Number,
        ),
      })
      .from(checks)
      .where(
        and(
          gt(checks.timestamp, sql`now() - interval '24 hours'`),
          inArray(checks.endpoint_id, ownedEndpointIds),
        ),
      )
      .groupBy(checks.endpoint_id),

    // Sparkline history
    db
      .select({
        id: checks.endpoint_id,
        time: checks.timestamp,
        value: checks.response_time,
        status: checks.status_code,
      })
      .from(checks)
      .where(
        and(
          gt(checks.timestamp, sql`now() - interval '24 hours'`),
          inArray(checks.endpoint_id, ownedEndpointIds),
        ),
      )
      .orderBy(checks.timestamp),
  ]);

  return {
    allEndpoints,
    latestCheckResults,
    stats24h,
    stats7d,
    stats30d,
    avgs,
    history,
  };
}

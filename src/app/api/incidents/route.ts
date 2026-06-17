import "dotenv/config";
import { createSelectSchema } from "drizzle-orm/zod";
import { endpoints, incidents } from "../../../db/schema";
import { NextResponse } from "next/server";
import { db } from "@/src";
import { desc, eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

type SelectIncident = typeof incidents.$inferSelect;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const ownedEndpointIds = db
      .select({ id: endpoints.id })
      .from(endpoints)
      .where(eq(endpoints.user_id, userId));

    const incidentsSelectSchema = createSelectSchema(incidents).array();
    const allIncidents = await db
      .select()
      .from(incidents)
      .where(inArray(incidents.endpoint_id, ownedEndpointIds))
      .orderBy(desc(incidents.started_at));
    const parsed: SelectIncident[] = incidentsSelectSchema.parse(allIncidents);
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

import "dotenv/config";
import { createSelectSchema, createInsertSchema } from "drizzle-orm/zod";
import { incidents } from "../../../db/schema";
import { NextResponse } from "next/server";
import { db } from "@/src";
import { desc } from "drizzle-orm";

type SelectIncident = typeof incidents.$inferSelect;

export async function GET() {
  try {
    const incidentsSelectSchema = createSelectSchema(incidents).array();
    const allIncidents = await db
      .select()
      .from(incidents)
      .orderBy(desc(incidents.started_at));
    const parsed: SelectIncident[] = incidentsSelectSchema.parse(allIncidents);
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

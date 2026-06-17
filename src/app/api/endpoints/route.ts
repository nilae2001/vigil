import "dotenv/config";
import { createSelectSchema, createInsertSchema } from "drizzle-orm/zod";
import { endpoints } from "../../../db/schema";
import { NextResponse } from "next/server";
import { db } from "@/src";
import { endpointQueue } from "@/lib/queue";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

type SelectEndpoint = typeof endpoints.$inferSelect;
type InserEndpoint = typeof endpoints.$inferInsert;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const endpointsSelectSchema = createSelectSchema(endpoints).array();
    const allEndpoints = await db
      .select()
      .from(endpoints)
      .where(eq(endpoints.user_id, userId));
    const parsed: SelectEndpoint[] = endpointsSelectSchema.parse(allEndpoints);
    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const endpoint = {
      user_id: userId,
      name: body.name,
      url: body.url,
      method: body.method,
      expected_status: body.expected_status,
      interval_seconds: body.interval_seconds,
      is_active: body.is_active ?? true,
    };
    const endpointInsertSchema = createInsertSchema(endpoints);
    const parsed: InserEndpoint = endpointInsertSchema.parse(endpoint);
    const [addedEndpoint] = await db
      .insert(endpoints)
      .values(parsed)
      .returning();
    await endpointQueue.add(
      `check-${addedEndpoint.id}`,
      {
        endpointId: addedEndpoint.id,
      },
      {
        repeat: {
          every: addedEndpoint.interval_seconds * 1000,
        },
      },
    );
    return NextResponse.json(
      { message: "Endpoint added successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to insert" }, { status: 500 });
  }
}

import "dotenv/config";
import { endpoints } from "@/src/db/schema";
import { createUpdateSchema } from "drizzle-orm/zod";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/src";
import { auth } from "@clerk/nextjs/server";

type UpdateEndpoint = Partial<typeof endpoints.$inferInsert>;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body: UpdateEndpoint = await request.json();
    const endpointUpdateSchema = createUpdateSchema(endpoints);
    const parsed: UpdateEndpoint = endpointUpdateSchema.parse(body);
    const patchEndpoint = await db
      .update(endpoints)
      .set(parsed)
      .where(and(eq(endpoints.id, id), eq(endpoints.user_id, userId)))
      .returning();
    if (patchEndpoint.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(patchEndpoint);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const deleted = await db
      .delete(endpoints)
      .where(and(eq(endpoints.id, id), eq(endpoints.user_id, userId)))
      .returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 },
    );
  }
}

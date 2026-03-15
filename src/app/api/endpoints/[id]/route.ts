import "dotenv/config";
import { endpoints } from "@/src/db/schema";
import { createUpdateSchema } from "drizzle-orm/zod";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/src";

type UpdateEndpoint = Partial<typeof endpoints.$inferInsert>;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body: UpdateEndpoint = await request.json();
    const endpointUpdateSchema = createUpdateSchema(endpoints);
    const parsed: UpdateEndpoint = endpointUpdateSchema.parse(body);
    const patchEndpoint = await db
      .update(endpoints)
      .set(parsed)
      .where(eq(endpoints.id, id))
      .returning();
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
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    await db.delete(endpoints).where(eq(endpoints.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { operationalEvents, workspaces } from "@/lib/schema";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = updateSchema.parse(await req.json());
    const db = getDb();

    const [existing] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [updated] = await db
      .update(workspaces)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(workspaces.id, id))
      .returning();

    const changes: string[] = [];
    if (body.name && body.name !== existing.name) changes.push("name");
    if (body.description !== undefined && body.description !== existing.description)
      changes.push("description");

    if (changes.length > 0) {
      await db.insert(operationalEvents).values({
        workspaceId: id,
        eventType: "resource_updated",
        description:
          body.name && body.name !== existing.name
            ? `Workspace renamed to ${body.name}`
            : `Workspace ${changes.join(", ")} updated`,
        metadata: {
          from: { name: existing.name, description: existing.description },
          to: { name: updated.name, description: updated.description },
        },
      });
    }

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

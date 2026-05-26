import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { operationalEvents, reminders, resources } from "@/lib/schema";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  isAcknowledged: z.boolean().optional(),
  acknowledgedAt: z.string().optional().nullable(),
  message: z.string().max(500).optional().nullable(),
  severity: z.enum(["critical", "high", "medium", "low"]).optional(),
  triggerDate: z.string().optional(),
  actor: z.string().max(100).optional(),
});

const REMINDER_TYPE_LABEL: Record<string, string> = {
  renewal: "Renewal",
  trial_expiration: "Trial expiration",
  ownership_review: "Ownership review",
  lifecycle_review: "Lifecycle review",
  custom: "Custom",
};

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = patchSchema.parse(await req.json());
    const db = getDb();

    const [existing] = await db
      .select()
      .from(reminders)
      .where(eq(reminders.id, id))
      .limit(1);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const update: Record<string, unknown> = { ...body };
    if (body.isAcknowledged === true && !body.acknowledgedAt) {
      update.acknowledgedAt = new Date().toISOString();
    }

    const [updated] = await db
      .update(reminders)
      .set(update)
      .where(eq(reminders.id, id))
      .returning();

    if (body.isAcknowledged === true && !existing.isAcknowledged) {
      const [resource] = await db
        .select()
        .from(resources)
        .where(eq(resources.id, existing.resourceId))
        .limit(1);
      if (resource) {
        const typeLabel =
          REMINDER_TYPE_LABEL[existing.reminderType] ?? existing.reminderType;
        const actor = body.actor?.trim() || "user";
        await db.insert(operationalEvents).values({
          workspaceId: resource.workspaceId,
          projectId: resource.projectId,
          resourceId: resource.id,
          eventType: "lifecycle_changed",
          actor,
          description: `${typeLabel} reminder for ${resource.name} acknowledged by ${actor}`,
          metadata: {
            reminderId: existing.id,
            reminderType: existing.reminderType,
            severity: existing.severity,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const result = await db.delete(reminders).where(eq(reminders.id, id)).returning();
    if (result.length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

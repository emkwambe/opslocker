import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { operationalEvents, projects, resources } from "@/lib/schema";
import { updateResourceSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

const LIFECYCLE_VERB: Record<string, string> = {
  active: "marked active",
  trial: "moved into trial",
  at_risk: "flagged as at-risk",
  deprecated: "marked deprecated",
  archived: "archived",
};

const LIFECYCLE_EVENT_TYPE: Record<string, string> = {
  active: "resource_updated",
  trial: "resource_updated",
  at_risk: "resource_updated",
  deprecated: "service_deprecated",
  archived: "resource_archived",
};

const FIELD_LABELS: Record<string, string> = {
  name: "name",
  vendorName: "vendor",
  category: "category",
  environment: "environment",
  renewalDate: "renewal date",
  monthlyCost: "monthly cost",
  currency: "currency",
  notes: "notes",
  tags: "tags",
  website: "website",
  documentationUrl: "documentation link",
  projectId: "project",
};

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const [resource] = await getDb()
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1);
    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(resource);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = updateResourceSchema.parse(await req.json());
    const db = getDb();
    const [existing] = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [updated] = await db
      .update(resources)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(resources.id, id))
      .returning();

    const events: Array<{
      eventType: string;
      description: string;
      metadata: Record<string, unknown>;
    }> = [];

    // Lifecycle change
    if (body.lifecycleState && body.lifecycleState !== existing.lifecycleState) {
      const verb = LIFECYCLE_VERB[body.lifecycleState] ?? `marked ${body.lifecycleState}`;
      events.push({
        eventType: LIFECYCLE_EVENT_TYPE[body.lifecycleState] ?? "lifecycle_changed",
        description: `${existing.name} ${verb} (was ${existing.lifecycleState.replace(
          "_",
          " "
        )})`,
        metadata: { from: existing.lifecycleState, to: body.lifecycleState },
      });
    }

    // Ownership change
    if (body.owner !== undefined && body.owner !== existing.owner) {
      const desc = body.owner
        ? existing.owner
          ? `${existing.name} ownership transferred from ${existing.owner} to ${body.owner}`
          : `${existing.name} ownership assigned to ${body.owner}`
        : `${existing.name} ownership cleared — no current owner`;
      events.push({
        eventType: "ownership_changed",
        description: desc,
        metadata: { from: existing.owner, to: body.owner },
      });
    }

    // Mark-reviewed (explicit lastReviewedAt write)
    const isMarkReviewed =
      body.lastReviewedAt !== undefined &&
      body.lastReviewedAt !== existing.lastReviewedAt &&
      Object.keys(body).filter(
        (k) => k !== "lastReviewedAt" && body[k as keyof typeof body] !== undefined
      ).length === 0;
    if (isMarkReviewed) {
      events.push({
        eventType: "resource_reviewed",
        description: `${existing.name} reviewed — operational status confirmed`,
        metadata: { previousReviewedAt: existing.lastReviewedAt },
      });
    }

    // Other field changes — bundled into one "updated" event if not already covered
    const otherChanges = Object.entries(body).filter(
      ([k, v]) =>
        k !== "lifecycleState" &&
        k !== "owner" &&
        k !== "lastReviewedAt" &&
        v !== undefined &&
        (existing as Record<string, unknown>)[k] !== v
    );
    if (events.length === 0 && otherChanges.length > 0) {
      const changedLabels = otherChanges.map(([k]) => FIELD_LABELS[k] ?? k);
      const list =
        changedLabels.length <= 3
          ? changedLabels.join(", ")
          : `${changedLabels.slice(0, 3).join(", ")} and ${
              changedLabels.length - 3
            } more`;
      events.push({
        eventType: "resource_updated",
        description: `${existing.name} updated — ${list}`,
        metadata: { changedFields: otherChanges.map(([k]) => k) },
      });
    }

    if (events.length > 0) {
      await db.insert(operationalEvents).values(
        events.map((e) => ({
          workspaceId: existing.workspaceId,
          projectId: existing.projectId,
          resourceId: existing.id,
          eventType: e.eventType,
          description: e.description,
          metadata: e.metadata,
        }))
      );
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
    const [existing] = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [project] = await db
      .select({ name: projects.name })
      .from(projects)
      .where(eq(projects.id, existing.projectId))
      .limit(1);

    await db.insert(operationalEvents).values({
      workspaceId: existing.workspaceId,
      projectId: existing.projectId,
      resourceId: null,
      eventType: "resource_archived",
      description: `${existing.name} deleted from ${project?.name ?? "registry"} — ${
        existing.vendorName ?? existing.category
      } removed permanently`,
      metadata: {
        vendorName: existing.vendorName,
        category: existing.category,
        lifecycleState: existing.lifecycleState,
      },
    });

    await db.delete(resources).where(eq(resources.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

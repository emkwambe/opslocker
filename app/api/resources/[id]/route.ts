import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { operationalEvents, resources } from "@/lib/schema";
import { updateResourceSchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

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

    if (body.lifecycleState && body.lifecycleState !== existing.lifecycleState) {
      const verbMap: Record<string, string> = {
        active: "marked active",
        trial: "moved to trial",
        at_risk: "flagged as at risk",
        deprecated: "marked deprecated",
        archived: "archived",
      };
      events.push({
        eventType:
          body.lifecycleState === "archived"
            ? "resource_archived"
            : body.lifecycleState === "deprecated"
            ? "service_deprecated"
            : "resource_updated",
        description: `${existing.name} ${verbMap[body.lifecycleState] ?? "lifecycle changed"}`,
        metadata: { from: existing.lifecycleState, to: body.lifecycleState },
      });
    }

    if (body.owner !== undefined && body.owner !== existing.owner) {
      events.push({
        eventType: "ownership_changed",
        description: `${existing.name} owner changed${body.owner ? ` to ${body.owner}` : " (cleared)"}`,
        metadata: { from: existing.owner, to: body.owner },
      });
    }

    const otherChanges = Object.entries(body).filter(
      ([k, v]) =>
        k !== "lifecycleState" &&
        k !== "owner" &&
        v !== undefined &&
        (existing as Record<string, unknown>)[k] !== v
    );
    if (events.length === 0 && otherChanges.length > 0) {
      events.push({
        eventType: "resource_updated",
        description: `${existing.name} updated`,
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

    await db.insert(operationalEvents).values({
      workspaceId: existing.workspaceId,
      projectId: existing.projectId,
      resourceId: null,
      eventType: "resource_archived",
      description: `${existing.name} deleted from registry`,
      metadata: { vendorName: existing.vendorName, category: existing.category },
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

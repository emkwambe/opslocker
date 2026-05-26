import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { operationalEvents, projects, resources } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId)
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const resourceId = searchParams.get("resourceId");
    const eventTypeParam = searchParams.get("eventType");
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0"), 0);

    const conditions = [eq(operationalEvents.workspaceId, workspaceId)];
    if (resourceId) conditions.push(eq(operationalEvents.resourceId, resourceId));
    if (eventTypeParam) {
      const types = eventTypeParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (types.length === 1) conditions.push(eq(operationalEvents.eventType, types[0]));
      else if (types.length > 1) conditions.push(inArray(operationalEvents.eventType, types));
    }

    const db = getDb();
    const rows = await db
      .select({
        event: operationalEvents,
        resourceName: resources.name,
        projectName: projects.name,
        projectColor: projects.color,
      })
      .from(operationalEvents)
      .leftJoin(resources, eq(resources.id, operationalEvents.resourceId))
      .leftJoin(projects, eq(projects.id, operationalEvents.projectId))
      .where(and(...conditions))
      .orderBy(desc(operationalEvents.timestamp))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const data = (hasMore ? rows.slice(0, limit) : rows).map((r) => ({
      ...r.event,
      resourceName: r.resourceName,
      projectName: r.projectName,
      projectColor: r.projectColor,
    }));

    return NextResponse.json({
      events: data,
      hasMore,
      nextOffset: hasMore ? offset + limit : null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

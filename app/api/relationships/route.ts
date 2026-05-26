import { NextRequest, NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { operationalEvents, relationships, resources } from "@/lib/schema";

const RELATIONSHIP_TYPES = [
  "depends_on",
  "bills_through",
  "authenticates_with",
  "sends_through",
  "deploys_to",
  "integrates_with",
] as const;

const createRelationshipSchema = z.object({
  sourceResourceId: z.string().min(1),
  targetResourceId: z.string().min(1),
  relationshipType: z.enum(RELATIONSHIP_TYPES),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const workspaceId = new URL(req.url).searchParams.get("workspaceId");
    if (!workspaceId)
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const db = getDb();
    const source = alias(resources, "source");
    const target = alias(resources, "target");

    const rows = await db
      .select({
        relationship: relationships,
        sourceName: source.name,
        sourceCategory: source.category,
        sourceLifecycle: source.lifecycleState,
        targetName: target.name,
        targetCategory: target.category,
        targetLifecycle: target.lifecycleState,
      })
      .from(relationships)
      .innerJoin(source, eq(source.id, relationships.sourceResourceId))
      .innerJoin(target, eq(target.id, relationships.targetResourceId))
      .where(eq(source.workspaceId, workspaceId));

    return NextResponse.json(
      rows.map((r) => ({
        ...r.relationship,
        sourceName: r.sourceName,
        sourceCategory: r.sourceCategory,
        sourceLifecycle: r.sourceLifecycle,
        targetName: r.targetName,
        targetCategory: r.targetCategory,
        targetLifecycle: r.targetLifecycle,
      }))
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createRelationshipSchema.parse(await req.json());
    if (body.sourceResourceId === body.targetResourceId) {
      return NextResponse.json(
        { error: "A resource cannot depend on itself" },
        { status: 400 }
      );
    }

    const db = getDb();

    const [src] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, body.sourceResourceId))
      .limit(1);
    const [tgt] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, body.targetResourceId))
      .limit(1);
    if (!src || !tgt)
      return NextResponse.json(
        { error: "Source or target resource not found" },
        { status: 404 }
      );

    const existing = await db
      .select({ id: relationships.id })
      .from(relationships)
      .where(
        or(
          and(
            eq(relationships.sourceResourceId, body.sourceResourceId),
            eq(relationships.targetResourceId, body.targetResourceId)
          ),
          and(
            eq(relationships.sourceResourceId, body.targetResourceId),
            eq(relationships.targetResourceId, body.sourceResourceId)
          )
        )
      )
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A relationship between these resources already exists" },
        { status: 409 }
      );
    }

    const [created] = await db.insert(relationships).values(body).returning();

    await db.insert(operationalEvents).values({
      workspaceId: src.workspaceId,
      projectId: src.projectId,
      resourceId: src.id,
      eventType: "relationship_added",
      description: `${src.name} ${body.relationshipType.replace(/_/g, " ")} ${tgt.name}`,
      metadata: {
        relationshipId: created.id,
        targetResourceId: tgt.id,
        relationshipType: body.relationshipType,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

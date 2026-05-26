import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { operationalEvents, resources } from "@/lib/schema";
import { createResourceSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const projectId = searchParams.get("projectId");
    const db = getDb();

    const conditions = [
      workspaceId ? eq(resources.workspaceId, workspaceId) : undefined,
      projectId ? eq(resources.projectId, projectId) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const result =
      conditions.length > 0
        ? await db
            .select()
            .from(resources)
            .where(and(...conditions))
            .orderBy(desc(resources.updatedAt))
        : await db.select().from(resources).orderBy(desc(resources.updatedAt));

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createResourceSchema.parse(await req.json());
    const db = getDb();
    const [resource] = await db.insert(resources).values(body).returning();
    await db.insert(operationalEvents).values({
      resourceId: resource.id,
      workspaceId: resource.workspaceId,
      projectId: resource.projectId,
      eventType: "resource_created",
      description: `${resource.name} added to registry`,
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

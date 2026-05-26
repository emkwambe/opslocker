import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { resources, operationalEvents } from "@/lib/schema";
import { createResourceSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const db = getDb();
    const result = workspaceId
      ? await db.select().from(resources).where(eq(resources.workspaceId, workspaceId))
      : await db.select().from(resources);
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  try {
    const body = createResourceSchema.parse(await req.json());
    const db = getDb();
    const [resource] = await db.insert(resources).values(body).returning();
    await db.insert(operationalEvents).values({ resourceId: resource.id, workspaceId: resource.workspaceId, projectId: resource.projectId, eventType: "resource_created", description: `Resource "${resource.name}" created` });
    return NextResponse.json(resource, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
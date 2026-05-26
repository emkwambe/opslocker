import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { projects, resources } from "@/lib/schema";
import { createProjectSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = new URL(req.url).searchParams.get("workspaceId");
    const db = getDb();

    const rows = workspaceId
      ? await db
          .select({
            project: projects,
            resourceCount: sql<number>`count(${resources.id})`.as("resource_count"),
          })
          .from(projects)
          .leftJoin(resources, eq(resources.projectId, projects.id))
          .where(eq(projects.workspaceId, workspaceId))
          .groupBy(projects.id)
      : await db
          .select({
            project: projects,
            resourceCount: sql<number>`count(${resources.id})`.as("resource_count"),
          })
          .from(projects)
          .leftJoin(resources, eq(resources.projectId, projects.id))
          .groupBy(projects.id);

    return NextResponse.json(
      rows.map((r) => ({ ...r.project, resourceCount: Number(r.resourceCount ?? 0) }))
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
    const body = createProjectSchema.parse(await req.json());
    const [project] = await getDb().insert(projects).values(body).returning();
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

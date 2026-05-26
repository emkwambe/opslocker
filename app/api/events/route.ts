import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { operationalEvents } from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");
    const workspaceId = searchParams.get("workspaceId");
    const db = getDb();

    if (resourceId) {
      const rows = await db
        .select()
        .from(operationalEvents)
        .where(eq(operationalEvents.resourceId, resourceId))
        .orderBy(desc(operationalEvents.timestamp));
      return NextResponse.json(rows);
    }
    if (workspaceId) {
      const rows = await db
        .select()
        .from(operationalEvents)
        .where(eq(operationalEvents.workspaceId, workspaceId))
        .orderBy(desc(operationalEvents.timestamp))
        .limit(200);
      return NextResponse.json(rows);
    }
    return NextResponse.json({ error: "resourceId or workspaceId required" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

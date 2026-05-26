import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { reminders, resources } from "@/lib/schema";
import { createReminderSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");
    const workspaceId = searchParams.get("workspaceId");
    const db = getDb();

    if (resourceId) {
      const rows = await db
        .select()
        .from(reminders)
        .where(eq(reminders.resourceId, resourceId))
        .orderBy(asc(reminders.triggerDate));
      return NextResponse.json(rows);
    }

    if (workspaceId) {
      const rows = await db
        .select({
          reminder: reminders,
          resourceName: resources.name,
          resourceVendor: resources.vendorName,
          projectId: resources.projectId,
        })
        .from(reminders)
        .innerJoin(resources, eq(resources.id, reminders.resourceId))
        .where(eq(resources.workspaceId, workspaceId))
        .orderBy(asc(reminders.triggerDate));
      return NextResponse.json(
        rows.map((r) => ({
          ...r.reminder,
          resourceName: r.resourceName,
          resourceVendor: r.resourceVendor,
          projectId: r.projectId,
        }))
      );
    }

    const rows = await db.select().from(reminders).orderBy(asc(reminders.triggerDate));
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createReminderSchema.parse(await req.json());
    const [reminder] = await getDb().insert(reminders).values(body).returning();
    return NextResponse.json(reminder, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

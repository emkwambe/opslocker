import { NextRequest, NextResponse } from "next/server";
import { count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb } from "@/lib/db/client";
import {
  invoices,
  operationalEvents,
  projects,
  relationships,
  reminders,
  resources,
  workspaces,
} from "@/lib/schema";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = new URL(req.url).searchParams.get("workspaceId");
    if (!workspaceId)
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const db = getDb();
    const source = alias(resources, "source");

    const [
      [workspaceRow],
      [projectCount],
      [resourceCount],
      [relationshipCount],
      [eventCount],
      invoiceRows,
      reminderRows,
    ] = await Promise.all([
      db
        .select({ id: workspaces.id, name: workspaces.name })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1),
      db
        .select({ value: count() })
        .from(projects)
        .where(eq(projects.workspaceId, workspaceId)),
      db
        .select({ value: count() })
        .from(resources)
        .where(eq(resources.workspaceId, workspaceId)),
      db
        .select({ value: count() })
        .from(relationships)
        .innerJoin(source, eq(source.id, relationships.sourceResourceId))
        .where(eq(source.workspaceId, workspaceId)),
      db
        .select({ value: count() })
        .from(operationalEvents)
        .where(eq(operationalEvents.workspaceId, workspaceId)),
      db
        .select({ id: invoices.id })
        .from(invoices)
        .innerJoin(resources, eq(resources.id, invoices.resourceId))
        .where(eq(resources.workspaceId, workspaceId)),
      db
        .select({ id: reminders.id })
        .from(reminders)
        .innerJoin(resources, eq(resources.id, reminders.resourceId))
        .where(eq(resources.workspaceId, workspaceId)),
    ]);

    if (!workspaceRow)
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

    return NextResponse.json({
      workspace: { id: workspaceRow.id, name: workspaceRow.name },
      counts: {
        workspaces: 1,
        projects: projectCount.value,
        resources: resourceCount.value,
        relationships: relationshipCount.value,
        events: eventCount.value,
        invoices: invoiceRows.length,
        reminders: reminderRows.length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

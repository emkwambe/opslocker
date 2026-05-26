import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "workspace";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") ?? "json";
    const workspaceId = searchParams.get("workspaceId");

    const db = getDb();
    const source = alias(resources, "source");

    const allWorkspaces = workspaceId
      ? await db.select().from(workspaces).where(eq(workspaces.id, workspaceId))
      : await db.select().from(workspaces);
    const targetWorkspaceId = workspaceId ?? allWorkspaces[0]?.id;
    const workspaceName = allWorkspaces[0]?.name ?? "workspace";

    const data = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      workspaces: allWorkspaces,
      projects: targetWorkspaceId
        ? await db
            .select()
            .from(projects)
            .where(eq(projects.workspaceId, targetWorkspaceId))
        : await db.select().from(projects),
      resources: targetWorkspaceId
        ? await db
            .select()
            .from(resources)
            .where(eq(resources.workspaceId, targetWorkspaceId))
        : await db.select().from(resources),
      relationships: targetWorkspaceId
        ? (
            await db
              .select({ rel: relationships })
              .from(relationships)
              .innerJoin(source, eq(source.id, relationships.sourceResourceId))
              .where(eq(source.workspaceId, targetWorkspaceId))
          ).map((r) => r.rel)
        : await db.select().from(relationships),
      events: targetWorkspaceId
        ? await db
            .select()
            .from(operationalEvents)
            .where(eq(operationalEvents.workspaceId, targetWorkspaceId))
        : await db.select().from(operationalEvents),
      invoices: targetWorkspaceId
        ? (
            await db
              .select({ inv: invoices })
              .from(invoices)
              .innerJoin(resources, eq(resources.id, invoices.resourceId))
              .where(eq(resources.workspaceId, targetWorkspaceId))
          ).map((r) => r.inv)
        : await db.select().from(invoices),
      reminders: targetWorkspaceId
        ? (
            await db
              .select({ rem: reminders })
              .from(reminders)
              .innerJoin(resources, eq(resources.id, reminders.resourceId))
              .where(eq(resources.workspaceId, targetWorkspaceId))
          ).map((r) => r.rem)
        : await db.select().from(reminders),
    };

    const today = new Date().toISOString().slice(0, 10);
    const baseName = `opslocker-${slugify(workspaceName)}-${today}`;

    if (format === "csv") {
      const headers = [
        "id",
        "name",
        "vendorName",
        "category",
        "owner",
        "lifecycleState",
        "renewalDate",
        "monthlyCost",
        "currency",
      ];
      const escape = (v: unknown) => {
        const s = v == null ? "" : String(v);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const csv = [
        headers.join(","),
        ...data.resources.map((r) =>
          headers
            .map((h) => escape((r as Record<string, unknown>)[h] ?? ""))
            .join(",")
        ),
      ].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${baseName}.csv"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${baseName}.json"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}

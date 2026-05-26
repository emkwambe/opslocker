import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { workspaces, projects, resources, relationships, operationalEvents, invoices, reminders } from "@/lib/schema";
export async function GET(req: NextRequest) {
  try {
    const format = new URL(req.url).searchParams.get("format") ?? "json";
    const db = getDb();
    const data = { exportedAt: new Date().toISOString(), version: "1.0.0", workspaces: await db.select().from(workspaces), projects: await db.select().from(projects), resources: await db.select().from(resources), relationships: await db.select().from(relationships), events: await db.select().from(operationalEvents), invoices: await db.select().from(invoices), reminders: await db.select().from(reminders) };
    if (format === "csv") {
      const headers = ["id","name","vendorName","category","owner","lifecycleState","renewalDate","monthlyCost"];
      const csv = [headers.join(","), ...data.resources.map(r => headers.map(h => String((r as Record<string,unknown>)[h] ?? "")).join(","))].join("\n");
      return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="opslocker-export.csv"` } });
    }
    return new NextResponse(JSON.stringify(data, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="opslocker-export.json"` } });
  } catch { return NextResponse.json({ error: "Export failed" }, { status: 500 }); }
}
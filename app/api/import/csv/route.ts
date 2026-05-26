import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import Papa from "papaparse";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { operationalEvents, projects, resources } from "@/lib/schema";

const rowSchema = z.object({
  name: z.string().min(1).max(200),
  vendorName: z.string().max(100).optional(),
  category: z
    .enum([
      "database",
      "api",
      "domain",
      "cloud",
      "auth",
      "ci_cd",
      "analytics",
      "communication",
      "storage",
      "monitoring",
      "subscription",
      "other",
    ])
    .default("other"),
  environment: z
    .enum(["development", "staging", "production", "all"])
    .default("production"),
  owner: z.string().max(100).optional(),
  lifecycleState: z
    .enum(["active", "trial", "at_risk", "deprecated", "archived"])
    .default("active"),
  renewalDate: z.string().optional(),
  monthlyCost: z.coerce.number().min(0).default(0),
  currency: z.string().default("USD"),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string()).default([]),
  website: z.string().optional(),
});

function normalizeRow(raw: Record<string, unknown>): Record<string, unknown> {
  const get = (key: string) => {
    const v = raw[key];
    if (typeof v === "string") {
      const trimmed = v.trim();
      return trimmed === "" ? undefined : trimmed;
    }
    return v;
  };
  const tagsRaw = get("tags");
  const tags =
    typeof tagsRaw === "string"
      ? tagsRaw.split(/[,;]/).map((t) => t.trim()).filter(Boolean)
      : Array.isArray(tagsRaw)
      ? (tagsRaw as string[])
      : [];
  return {
    name: get("name"),
    vendorName: get("vendorName") ?? get("vendor"),
    category: get("category"),
    environment: get("environment") ?? get("env"),
    owner: get("owner"),
    lifecycleState: get("lifecycleState") ?? get("lifecycle"),
    renewalDate: get("renewalDate") ?? get("renewal"),
    monthlyCost: get("monthlyCost") ?? get("cost"),
    currency: get("currency"),
    notes: get("notes"),
    tags,
    website: get("website"),
  };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const projectId = form.get("projectId");
    const workspaceId = form.get("workspaceId");

    if (!(file instanceof File))
      return NextResponse.json({ error: "file required" }, { status: 400 });
    if (typeof projectId !== "string" || typeof workspaceId !== "string")
      return NextResponse.json(
        { error: "projectId and workspaceId required" },
        { status: 400 }
      );

    const db = getDb();
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (!project || project.workspaceId !== workspaceId)
      return NextResponse.json(
        { error: "Project not found in workspace" },
        { status: 404 }
      );

    const csvText = await file.text();
    const parsed = Papa.parse<Record<string, unknown>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: `CSV parse failed: ${parsed.errors[0].message}` },
        { status: 400 }
      );
    }

    const errors: Array<{ row: number; message: string }> = [];
    const validRows: z.infer<typeof rowSchema>[] = [];

    parsed.data.forEach((raw, i) => {
      const normalized = normalizeRow(raw);
      const result = rowSchema.safeParse(normalized);
      if (!result.success) {
        errors.push({
          row: i + 2, // +2 = header line + 1-indexed
          message: result.error.issues
            .map((iss) => `${iss.path.join(".") || "row"}: ${iss.message}`)
            .join("; "),
        });
        return;
      }
      validRows.push(result.data);
    });

    let imported = 0;
    if (validRows.length > 0) {
      const inserted = await db
        .insert(resources)
        .values(
          validRows.map((row) => ({
            ...row,
            projectId,
            workspaceId,
            renewalDate: row.renewalDate || null,
          }))
        )
        .returning();
      imported = inserted.length;

      await db.insert(operationalEvents).values(
        inserted.map((r) => ({
          workspaceId,
          projectId,
          resourceId: r.id,
          eventType: "resource_created",
          description: `${r.name} imported from CSV`,
          metadata: { source: "csv_import" },
        }))
      );
    }

    return NextResponse.json({
      imported,
      skipped: errors.length,
      errors,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

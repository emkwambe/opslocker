import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { operationalEvents, projects, resources } from "@/lib/schema";

const bodySchema = z.object({
  content: z.string().min(1),
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
});

type EnvParseResult = { keys: string[]; skipped: number };

function parseEnv(content: string): EnvParseResult {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const keys: string[] = [];
  let skipped = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      skipped++;
      continue;
    }
    const eqIdx = line.indexOf("=");
    if (eqIdx <= 0) {
      skipped++;
      continue;
    }
    const key = line.slice(0, eqIdx).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      skipped++;
      continue;
    }
    keys.push(key);
  }

  // De-duplicate, preserving first occurrence
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const k of keys) {
    if (seen.has(k)) {
      skipped++;
      continue;
    }
    seen.add(k);
    unique.push(k);
  }

  return { keys: unique, skipped };
}

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());

    const db = getDb();
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, body.projectId))
      .limit(1);
    if (!project || project.workspaceId !== body.workspaceId)
      return NextResponse.json(
        { error: "Project not found in workspace" },
        { status: 404 }
      );

    const { keys, skipped } = parseEnv(body.content);

    if (keys.length === 0) {
      return NextResponse.json({ imported: 0, skipped });
    }

    const inserted = await db
      .insert(resources)
      .values(
        keys.map((key) => ({
          name: key,
          category: "api" as const,
          environment: "production" as const,
          lifecycleState: "active" as const,
          notes: "Imported from .env file",
          tags: ["env"],
          projectId: body.projectId,
          workspaceId: body.workspaceId,
        }))
      )
      .returning();

    await db.insert(operationalEvents).values(
      inserted.map((r) => ({
        workspaceId: body.workspaceId,
        projectId: body.projectId,
        resourceId: r.id,
        eventType: "resource_created",
        description: `${r.name} imported from .env`,
        metadata: { source: "env_import" },
      }))
    );

    return NextResponse.json({ imported: inserted.length, skipped });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

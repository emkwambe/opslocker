import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb } from "@/lib/db/client";
import { projects, relationships, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { GraphViewLoader as GraphView } from "@/components/graph/graph-view-loader";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const db = getDb();
  const source = alias(resources, "source");

  const [resourceRows, relationshipRows, projectRows] = await Promise.all([
    db.select().from(resources).where(eq(resources.workspaceId, workspace.id)),
    db
      .select({ rel: relationships })
      .from(relationships)
      .innerJoin(source, eq(source.id, relationships.sourceResourceId))
      .where(eq(source.workspaceId, workspace.id)),
    db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(eq(projects.workspaceId, workspace.id))
      .orderBy(projects.name),
  ]);

  return (
    <div className="space-y-4 max-w-[1400px]">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">Dependency graph</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            See ownership, billing, and decommission risk across your operational stack.
          </p>
        </div>
      </div>

      <GraphView
        workspaceId={workspace.id}
        resources={resourceRows}
        relationships={relationshipRows.map((r) => r.rel)}
        projects={projectRows}
      />
    </div>
  );
}

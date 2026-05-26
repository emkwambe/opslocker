import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { projects, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { ProjectsView } from "@/components/projects/projects-view";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const rows = await getDb()
    .select({
      project: projects,
      resourceCount: sql<number>`count(${resources.id})`.as("resource_count"),
    })
    .from(projects)
    .leftJoin(resources, eq(resources.projectId, projects.id))
    .where(eq(projects.workspaceId, workspace.id))
    .groupBy(projects.id)
    .orderBy(projects.name);

  const projectsWithCount = rows.map((r) => ({
    ...r.project,
    resourceCount: Number(r.resourceCount ?? 0),
  }));

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">Projects</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Group infrastructure by application, environment, or domain.
          </p>
        </div>
      </div>

      <ProjectsView workspaceId={workspace.id} projects={projectsWithCount} />
    </div>
  );
}

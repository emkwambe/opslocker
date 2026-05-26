import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { projects, resources } from "@/lib/schema";
import { ProjectHeader } from "@/components/projects/project-header";
import { RegistryView } from "@/components/registry/registry-view";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) notFound();

  const [resourceRows, projectOptions] = await Promise.all([
    db
      .select()
      .from(resources)
      .where(eq(resources.projectId, project.id))
      .orderBy(desc(resources.updatedAt)),
    db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(eq(projects.workspaceId, project.workspaceId))
      .orderBy(projects.name),
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      <ProjectHeader project={project} />
      <RegistryView
        workspaceId={project.workspaceId}
        resources={resourceRows}
        projects={projectOptions}
        scopedProjectId={project.id}
      />
    </div>
  );
}

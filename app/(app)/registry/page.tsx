import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { projects, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { RegistryView } from "@/components/registry/registry-view";

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");
  const db = getDb();
  const [resourceRows, projectRows] = await Promise.all([
    db
      .select()
      .from(resources)
      .where(eq(resources.workspaceId, workspace.id))
      .orderBy(desc(resources.updatedAt)),
    db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(eq(projects.workspaceId, workspace.id))
      .orderBy(projects.name),
  ]);

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">Registry</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Every vendor, subscription, API, and piece of infrastructure your team relies on.
          </p>
        </div>
      </div>

      <RegistryView
        workspaceId={workspace.id}
        resources={resourceRows}
        projects={projectRows}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import {
  getDefaultWorkspace,
  getWorkspaceProjects,
  getWorkspaceResources,
} from "@/lib/db/queries";
import { RegistryView } from "@/components/registry/registry-view";

export const dynamic = "force-dynamic";

export default async function RegistryPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const [resourceRows, allProjects] = await Promise.all([
    getWorkspaceResources(workspace.id),
    getWorkspaceProjects(workspace.id),
  ]);
  const projectRows = allProjects.map((p) => ({ id: p.id, name: p.name }));

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

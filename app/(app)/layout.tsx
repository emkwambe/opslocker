import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { GlobalDialogs } from "@/components/layout/global-dialogs";
import { CommandPalette } from "@/components/layout/command-palette";
import {
  getDefaultWorkspace,
  getWorkspaceProjects,
  getWorkspaceResources,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getDefaultWorkspace();

  const [allProjects, allResources] = workspace
    ? await Promise.all([
        getWorkspaceProjects(workspace.id),
        getWorkspaceResources(workspace.id),
      ])
    : [[], []];

  // Project to only what the palette + dialogs need — full rows live in React.cache
  // and are reused by pages without re-querying.
  const projectRows = allProjects.map((p) => ({ id: p.id, name: p.name }));
  const resourceRows = allResources.map((r) => ({
    id: r.id,
    name: r.name,
    vendorName: r.vendorName,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0e]">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      {workspace && (
        <>
          <GlobalDialogs workspaceId={workspace.id} projects={projectRows} />
          <CommandPalette resources={resourceRows} />
        </>
      )}
    </div>
  );
}

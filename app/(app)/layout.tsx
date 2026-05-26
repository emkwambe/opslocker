import { eq } from "drizzle-orm";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { GlobalDialogs } from "@/components/layout/global-dialogs";
import { CommandPalette } from "@/components/layout/command-palette";
import { getDb } from "@/lib/db/client";
import { projects, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const workspace = await getDefaultWorkspace();
  const db = getDb();

  const [projectRows, resourceRows] = workspace
    ? await Promise.all([
        db
          .select({ id: projects.id, name: projects.name })
          .from(projects)
          .where(eq(projects.workspaceId, workspace.id))
          .orderBy(projects.name),
        db
          .select({
            id: resources.id,
            name: resources.name,
            vendorName: resources.vendorName,
          })
          .from(resources)
          .where(eq(resources.workspaceId, workspace.id))
          .orderBy(resources.name),
      ])
    : [[], []];

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

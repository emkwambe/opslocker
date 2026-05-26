import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { projects, reminders, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { SettingsView } from "@/components/settings/settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const db = getDb();
  const [[projectCount], [resourceCount], reminderRows] = await Promise.all([
    db
      .select({ value: count() })
      .from(projects)
      .where(eq(projects.workspaceId, workspace.id)),
    db
      .select({ value: count() })
      .from(resources)
      .where(eq(resources.workspaceId, workspace.id)),
    db
      .select({ id: reminders.id })
      .from(reminders)
      .innerJoin(resources, eq(resources.id, reminders.resourceId))
      .where(eq(resources.workspaceId, workspace.id)),
  ]);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {workspace.name}
        </p>
        <h1 className="text-2xl font-semibold text-slate-100 mt-1">Settings</h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Workspace settings — identity, data ownership, and import/export.
        </p>
      </div>

      <SettingsView
        workspace={{
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          createdAt: workspace.createdAt,
        }}
        stats={{
          projects: projectCount.value,
          resources: resourceCount.value,
          reminders: reminderRows.length,
        }}
      />
    </div>
  );
}

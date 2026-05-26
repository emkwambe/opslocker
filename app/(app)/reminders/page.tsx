import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { reminders, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { RemindersView } from "@/components/reminders/reminders-view";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const db = getDb();

  const [reminderRows, resourceRows] = await Promise.all([
    db
      .select({
        reminder: reminders,
        resourceName: resources.name,
        resourceVendor: resources.vendorName,
        projectId: resources.projectId,
      })
      .from(reminders)
      .innerJoin(resources, eq(resources.id, reminders.resourceId))
      .where(eq(resources.workspaceId, workspace.id))
      .orderBy(asc(reminders.triggerDate)),
    db
      .select({
        id: resources.id,
        name: resources.name,
        vendorName: resources.vendorName,
      })
      .from(resources)
      .where(eq(resources.workspaceId, workspace.id))
      .orderBy(resources.name),
  ]);

  const initialReminders = reminderRows.map((r) => ({
    ...r.reminder,
    resourceName: r.resourceName,
    resourceVendor: r.resourceVendor,
    projectId: r.projectId,
  }));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">Reminders</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Operational nudges grouped by urgency — acknowledge to clear.
          </p>
        </div>
      </div>

      <RemindersView
        workspaceId={workspace.id}
        initialReminders={initialReminders}
        resources={resourceRows}
      />
    </div>
  );
}

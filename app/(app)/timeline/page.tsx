import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { operationalEvents, projects, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { TimelineView } from "@/components/timeline/timeline-view";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function TimelinePage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const rows = await getDb()
    .select({
      event: operationalEvents,
      resourceName: resources.name,
      projectName: projects.name,
      projectColor: projects.color,
    })
    .from(operationalEvents)
    .leftJoin(resources, eq(resources.id, operationalEvents.resourceId))
    .leftJoin(projects, eq(projects.id, operationalEvents.projectId))
    .where(and(eq(operationalEvents.workspaceId, workspace.id)))
    .orderBy(desc(operationalEvents.timestamp))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const events = (hasMore ? rows.slice(0, PAGE_SIZE) : rows).map((r) => ({
    ...r.event,
    resourceName: r.resourceName,
    projectName: r.projectName,
    projectColor: r.projectColor,
  }));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">Timeline</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Operational history — every change to your infrastructure, in order.
          </p>
        </div>
      </div>

      <TimelineView
        workspaceId={workspace.id}
        initialEvents={events}
        initialHasMore={hasMore}
        initialNextOffset={hasMore ? PAGE_SIZE : null}
      />
    </div>
  );
}

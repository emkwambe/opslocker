import { cache } from "react";
import { and, desc, eq, gte, isNotNull, ne } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  operationalEvents,
  projects,
  resources,
  workspaces,
  type OperationalEvent,
  type Resource,
} from "@/lib/schema";

// React.cache() dedupes calls within a single server request — so the layout
// and the page can both call getDefaultWorkspace() without hitting SQLite twice.
export const getDefaultWorkspace = cache(async () => {
  const db = getDb();
  const [defaultWs] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.isDefault, true))
    .limit(1);
  if (defaultWs) return defaultWs;
  const [first] = await db.select().from(workspaces).limit(1);
  return first ?? null;
});

export const getWorkspaceProjects = cache(async (workspaceId: string) => {
  return getDb()
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .orderBy(projects.name);
});

export const getWorkspaceResources = cache(async (workspaceId: string) => {
  return getDb()
    .select()
    .from(resources)
    .where(eq(resources.workspaceId, workspaceId))
    .orderBy(desc(resources.updatedAt));
});

export type DashboardMetrics = {
  totalResources: number;
  activeResources: number;
  atRiskResources: number;
  upcomingRenewals: number;
  monthlySpend: number;
  wasteSignalsCount: number;
  wasteAnnualEstimate: number;
  currency: string;
};

export async function getDashboardMetrics(workspaceId: string): Promise<DashboardMetrics> {
  const db = getDb();
  const all = await db
    .select()
    .from(resources)
    .where(eq(resources.workspaceId, workspaceId));

  const today = new Date();
  const horizon = new Date();
  horizon.setDate(today.getDate() + 30);
  const todayISO = today.toISOString().slice(0, 10);
  const horizonISO = horizon.toISOString().slice(0, 10);

  const totalResources = all.length;
  const activeResources = all.filter((r) => r.lifecycleState === "active").length;
  const atRiskResources = all.filter(
    (r) => r.lifecycleState === "at_risk" || r.lifecycleState === "deprecated"
  ).length;
  const upcomingRenewals = all.filter((r) => {
    if (!r.renewalDate) return false;
    return r.renewalDate >= todayISO && r.renewalDate <= horizonISO;
  }).length;
  const monthlySpend = all
    .filter((r) => r.lifecycleState !== "archived")
    .reduce((sum, r) => sum + (r.monthlyCost ?? 0), 0);

  const wasteResources = all.filter(
    (r) =>
      (r.lifecycleState === "deprecated" || r.lifecycleState === "archived") &&
      (r.monthlyCost ?? 0) > 0
  );
  const wasteSignalsCount = wasteResources.length;
  const wasteAnnualEstimate =
    wasteResources.reduce((sum, r) => sum + (r.monthlyCost ?? 0), 0) * 12;

  return {
    totalResources,
    activeResources,
    atRiskResources,
    upcomingRenewals,
    monthlySpend,
    wasteSignalsCount,
    wasteAnnualEstimate,
    currency: all[0]?.currency ?? "USD",
  };
}

export async function getUpcomingRenewals(workspaceId: string, limit = 6): Promise<Resource[]> {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.workspaceId, workspaceId),
        isNotNull(resources.renewalDate),
        gte(resources.renewalDate, today),
        ne(resources.lifecycleState, "archived")
      )
    );
  return rows
    .filter((r): r is Resource & { renewalDate: string } => Boolean(r.renewalDate))
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate))
    .slice(0, limit);
}

export type ActivityRow = OperationalEvent & {
  resourceName: string | null;
  projectName: string | null;
};

export async function getRecentActivity(
  workspaceId: string,
  limit = 8
): Promise<ActivityRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      event: operationalEvents,
      resourceName: resources.name,
      projectName: projects.name,
    })
    .from(operationalEvents)
    .leftJoin(resources, eq(resources.id, operationalEvents.resourceId))
    .leftJoin(projects, eq(projects.id, operationalEvents.projectId))
    .where(eq(operationalEvents.workspaceId, workspaceId))
    .orderBy(desc(operationalEvents.timestamp))
    .limit(limit);

  return rows.map((r) => ({
    ...r.event,
    resourceName: r.resourceName,
    projectName: r.projectName,
  }));
}


import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { invoices, projects, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { FinancesViewLoader as FinancesView } from "@/components/finances/finances-view-loader";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const db = getDb();
  const [allResources, allProjects, invoiceRows] = await Promise.all([
    db.select().from(resources).where(eq(resources.workspaceId, workspace.id)),
    db.select().from(projects).where(eq(projects.workspaceId, workspace.id)),
    db
      .select({
        invoice: invoices,
        resourceName: resources.name,
        resourceVendor: resources.vendorName,
      })
      .from(invoices)
      .innerJoin(resources, eq(resources.id, invoices.resourceId))
      .where(eq(resources.workspaceId, workspace.id))
      .orderBy(desc(invoices.invoiceDate)),
  ]);

  const projectsById = Object.fromEntries(allProjects.map((p) => [p.id, p]));
  const currency = allResources[0]?.currency ?? "USD";

  const activeResources = allResources.filter((r) => r.lifecycleState !== "archived");
  const totalMonthlyCost = activeResources.reduce(
    (sum, r) => sum + (r.monthlyCost ?? 0),
    0
  );

  // By category
  const categoryMap = new Map<string, { monthlyCost: number; resourceCount: number }>();
  for (const r of activeResources) {
    const entry = categoryMap.get(r.category) ?? { monthlyCost: 0, resourceCount: 0 };
    entry.monthlyCost += r.monthlyCost ?? 0;
    entry.resourceCount += 1;
    categoryMap.set(r.category, entry);
  }
  const byCategory = Array.from(categoryMap.entries())
    .map(([category, v]) => ({ category, ...v }))
    .filter((c) => c.monthlyCost > 0)
    .sort((a, b) => b.monthlyCost - a.monthlyCost);

  // By project
  const projectSpend = new Map<string, { monthlyCost: number; resourceCount: number }>();
  for (const r of activeResources) {
    const entry = projectSpend.get(r.projectId) ?? {
      monthlyCost: 0,
      resourceCount: 0,
    };
    entry.monthlyCost += r.monthlyCost ?? 0;
    entry.resourceCount += 1;
    projectSpend.set(r.projectId, entry);
  }
  const byProject = Array.from(projectSpend.entries())
    .map(([projectId, v]) => ({
      projectId,
      projectName: projectsById[projectId]?.name ?? "—",
      projectColor: projectsById[projectId]?.color ?? null,
      monthlyCost: v.monthlyCost,
      resourceCount: v.resourceCount,
    }))
    .sort((a, b) => b.monthlyCost - a.monthlyCost);

  // Monthly trend
  const now = new Date();
  const months: Array<{ key: string; label: string; total: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    months.push({ key, label, total: 0 });
  }
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));
  for (const { invoice } of invoiceRows) {
    let key: string | null = null;
    if (invoice.invoiceDate) key = invoice.invoiceDate.slice(0, 7);
    else if (invoice.billingPeriod && /^\d{4}-\d{2}/.test(invoice.billingPeriod))
      key = invoice.billingPeriod.slice(0, 7);
    if (!key) continue;
    const idx = monthIndex.get(key);
    if (idx === undefined) continue;
    months[idx].total += invoice.amount ?? 0;
  }
  const monthlyTrend = months.map((m) => ({
    month: m.key,
    label: m.label,
    total: m.total,
  }));

  const wasteSignals = allResources
    .filter(
      (r) =>
        (r.lifecycleState === "deprecated" || r.lifecycleState === "archived") &&
        (r.monthlyCost ?? 0) > 0
    )
    .sort((a, b) => (b.monthlyCost ?? 0) - (a.monthlyCost ?? 0))
    .map((r) => ({
      id: r.id,
      name: r.name,
      vendorName: r.vendorName,
      monthlyCost: r.monthlyCost ?? 0,
      currency: r.currency ?? currency,
      lifecycleState: r.lifecycleState,
    }));

  const resourcesWithProject = allResources.map((r) => ({
    ...r,
    projectName: projectsById[r.projectId]?.name ?? "—",
    projectColor: projectsById[r.projectId]?.color ?? null,
  }));

  const invoiceList = invoiceRows.map((row) => ({
    ...row.invoice,
    resourceName: row.resourceName,
    resourceVendor: row.resourceVendor,
  }));

  const resourceOptions = allResources
    .map((r) => ({ id: r.id, name: r.name, vendorName: r.vendorName }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {workspace.name}
        </p>
        <h1 className="text-2xl font-semibold text-slate-100 mt-1">
          Financial Awareness
        </h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Operational spend at a glance — where the money goes, where it leaks.
        </p>
      </div>

      <FinancesView
        summary={{
          totalMonthlyCost,
          totalAnnualProjected: totalMonthlyCost * 12,
          byCategory,
          byProject,
          monthlyTrend,
          wasteSignals,
          currency,
        }}
        resources={resourcesWithProject}
        invoices={invoiceList}
        resourceOptions={resourceOptions}
      />
    </div>
  );
}

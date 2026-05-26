import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { invoices, projects, resources } from "@/lib/schema";

type VendorEntry = {
  vendorName: string;
  monthlyCost: number;
  resourceCount: number;
  lifecycleState: string;
};

type CategoryEntry = {
  category: string;
  monthlyCost: number;
  resourceCount: number;
};

type ProjectEntry = {
  projectId: string;
  projectName: string;
  projectColor: string | null;
  monthlyCost: number;
  resourceCount: number;
};

type TopSpender = {
  id: string;
  name: string;
  vendorName: string | null;
  monthlyCost: number;
  currency: string;
  lifecycleState: string;
};

type WasteSignal = {
  id: string;
  name: string;
  vendorName: string | null;
  monthlyCost: number;
  currency: string;
  lifecycleState: string;
  projectId: string;
};

export async function GET(req: NextRequest) {
  try {
    const workspaceId = new URL(req.url).searchParams.get("workspaceId");
    if (!workspaceId)
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

    const db = getDb();
    const [allResources, allProjects, joinedInvoices] = await Promise.all([
      db.select().from(resources).where(eq(resources.workspaceId, workspaceId)),
      db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, workspaceId)),
      db
        .select({ invoice: invoices, workspaceId: resources.workspaceId })
        .from(invoices)
        .innerJoin(resources, eq(resources.id, invoices.resourceId))
        .where(eq(resources.workspaceId, workspaceId)),
    ]);

    const projectsById = Object.fromEntries(allProjects.map((p) => [p.id, p]));
    const currency = allResources[0]?.currency ?? "USD";

    const activeResources = allResources.filter((r) => r.lifecycleState !== "archived");
    const totalMonthlyCost = activeResources.reduce(
      (sum, r) => sum + (r.monthlyCost ?? 0),
      0
    );
    const totalAnnualProjected = totalMonthlyCost * 12;
    const totalAnnualCost = joinedInvoices.reduce(
      (sum, row) => sum + (row.invoice.amount ?? 0),
      0
    );

    // By vendor
    const vendorMap = new Map<
      string,
      { monthlyCost: number; resourceCount: number; lifecycles: Set<string> }
    >();
    for (const r of activeResources) {
      const key = r.vendorName ?? r.name;
      if (!key) continue;
      const entry = vendorMap.get(key) ?? {
        monthlyCost: 0,
        resourceCount: 0,
        lifecycles: new Set<string>(),
      };
      entry.monthlyCost += r.monthlyCost ?? 0;
      entry.resourceCount += 1;
      entry.lifecycles.add(r.lifecycleState);
      vendorMap.set(key, entry);
    }
    const byVendor: VendorEntry[] = Array.from(vendorMap.entries())
      .map(([vendorName, v]) => ({
        vendorName,
        monthlyCost: v.monthlyCost,
        resourceCount: v.resourceCount,
        lifecycleState: pickWorstLifecycle(v.lifecycles),
      }))
      .filter((v) => v.monthlyCost > 0)
      .sort((a, b) => b.monthlyCost - a.monthlyCost);

    // By category
    const categoryMap = new Map<string, { monthlyCost: number; resourceCount: number }>();
    for (const r of activeResources) {
      const entry = categoryMap.get(r.category) ?? { monthlyCost: 0, resourceCount: 0 };
      entry.monthlyCost += r.monthlyCost ?? 0;
      entry.resourceCount += 1;
      categoryMap.set(r.category, entry);
    }
    const byCategory: CategoryEntry[] = Array.from(categoryMap.entries())
      .map(([category, v]) => ({ category, ...v }))
      .filter((c) => c.monthlyCost > 0)
      .sort((a, b) => b.monthlyCost - a.monthlyCost);

    // By project
    const projectMap = new Map<string, { monthlyCost: number; resourceCount: number }>();
    for (const r of activeResources) {
      const entry = projectMap.get(r.projectId) ?? {
        monthlyCost: 0,
        resourceCount: 0,
      };
      entry.monthlyCost += r.monthlyCost ?? 0;
      entry.resourceCount += 1;
      projectMap.set(r.projectId, entry);
    }
    const byProject: ProjectEntry[] = Array.from(projectMap.entries())
      .map(([projectId, v]) => ({
        projectId,
        projectName: projectsById[projectId]?.name ?? "—",
        projectColor: projectsById[projectId]?.color ?? null,
        monthlyCost: v.monthlyCost,
        resourceCount: v.resourceCount,
      }))
      .sort((a, b) => b.monthlyCost - a.monthlyCost);

    // Monthly trend: last 6 months
    const monthlyTrend = computeMonthlyTrend(
      joinedInvoices.map((i) => i.invoice)
    );

    const topSpenders: TopSpender[] = activeResources
      .filter((r) => (r.monthlyCost ?? 0) > 0)
      .sort((a, b) => (b.monthlyCost ?? 0) - (a.monthlyCost ?? 0))
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: r.name,
        vendorName: r.vendorName,
        monthlyCost: r.monthlyCost ?? 0,
        currency: r.currency ?? currency,
        lifecycleState: r.lifecycleState,
      }));

    const wasteSignals: WasteSignal[] = allResources
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
        projectId: r.projectId,
      }));

    return NextResponse.json({
      totalMonthlyCost,
      totalAnnualCost,
      totalAnnualProjected,
      byVendor,
      byCategory,
      byProject,
      monthlyTrend,
      topSpenders,
      wasteSignals,
      currency,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

function pickWorstLifecycle(states: Set<string>): string {
  const order = ["archived", "deprecated", "at_risk", "trial", "active"];
  for (const s of order) {
    if (states.has(s)) return s;
  }
  return "active";
}

function computeMonthlyTrend(
  rows: Array<{ amount: number | null; invoiceDate: string | null; billingPeriod: string | null }>
): Array<{ month: string; label: string; total: number }> {
  const now = new Date();
  // Build last 6 months including current, oldest first
  const months: Array<{ key: string; label: string; total: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    months.push({ key, label, total: 0 });
  }
  const index = new Map(months.map((m, i) => [m.key, i]));

  for (const inv of rows) {
    let key: string | null = null;
    if (inv.invoiceDate) {
      key = inv.invoiceDate.slice(0, 7);
    } else if (inv.billingPeriod && /^\d{4}-\d{2}/.test(inv.billingPeriod)) {
      key = inv.billingPeriod.slice(0, 7);
    }
    if (!key) continue;
    const i = index.get(key);
    if (i === undefined) continue;
    months[i].total += inv.amount ?? 0;
  }

  return months.map((m) => ({ month: m.key, label: m.label, total: m.total }));
}

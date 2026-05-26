import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { getDb } from "@/lib/db/client";
import { invoices, projects, relationships, resources } from "@/lib/schema";

export type Insight = {
  id: string;
  type:
    | "unowned"
    | "stale_review"
    | "unowned_dependency"
    | "upcoming_renewals"
    | "single_vendor_project"
    | "spend_growth"
    | "waste";
  severity: "low" | "medium" | "high";
  icon: string;
  headline: string;
  subtext: string;
  href: string;
  ctaLabel: string;
  metadata?: Record<string, unknown>;
};

function currency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function computeInsights(workspaceId: string): Promise<Insight[]> {
  const db = getDb();
  const source = alias(resources, "src");

  const [allResources, allProjects, allRelationships, allInvoices] = await Promise.all([
    db.select().from(resources).where(eq(resources.workspaceId, workspaceId)),
    db.select().from(projects).where(eq(projects.workspaceId, workspaceId)),
    db
      .select({ rel: relationships })
      .from(relationships)
      .innerJoin(source, eq(source.id, relationships.sourceResourceId))
      .where(eq(source.workspaceId, workspaceId)),
    db
      .select({ inv: invoices })
      .from(invoices)
      .innerJoin(resources, eq(resources.id, invoices.resourceId))
      .where(eq(resources.workspaceId, workspaceId))
      .orderBy(desc(invoices.invoiceDate)),
  ]);

  const resourcesById = Object.fromEntries(allResources.map((r) => [r.id, r]));
  const relationshipRows = allRelationships.map((r) => r.rel);
  const invoiceRows = allInvoices.map((r) => r.inv);
  const defaultCurrency = allResources[0]?.currency ?? "USD";

  const insights: Insight[] = [];
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  // 1. Unowned active resources
  const unowned = allResources.filter(
    (r) => r.lifecycleState === "active" && (!r.owner || r.owner.trim() === "")
  );
  if (unowned.length > 0) {
    insights.push({
      id: "unowned",
      type: "unowned",
      severity: unowned.length >= 3 ? "high" : "medium",
      icon: "UserX",
      headline:
        unowned.length === 1
          ? "1 active service has no operational owner"
          : `${unowned.length} active services have no operational owner`,
      subtext:
        "If any of these vendors need attention, nobody on the team is responsible.",
      href: "/registry",
      ctaLabel: "Assign owners",
      metadata: { resourceIds: unowned.map((r) => r.id) },
    });
  }

  // 2. Stale review (90+ days or never reviewed) — excludes archived
  const NINETY_DAYS_MS = 90 * 86_400_000;
  const now = Date.now();
  const stale = allResources.filter((r) => {
    if (r.lifecycleState === "archived") return false;
    if (!r.lastReviewedAt) return true;
    return now - new Date(r.lastReviewedAt).getTime() > NINETY_DAYS_MS;
  });
  if (stale.length > 0) {
    const neverCount = stale.filter((r) => !r.lastReviewedAt).length;
    insights.push({
      id: "stale_review",
      type: "stale_review",
      severity: stale.length >= 5 ? "high" : "medium",
      icon: "Clock",
      headline: `${stale.length} resource${stale.length === 1 ? "" : "s"} haven't been reviewed in 90+ days`,
      subtext:
        neverCount > 0
          ? `${neverCount} of them have never been reviewed — operational context may be stale.`
          : "Periodic review confirms ownership, lifecycle, and continued necessity.",
      href: "/registry",
      ctaLabel: "Open registry",
      metadata: { resourceIds: stale.map((r) => r.id) },
    });
  }

  // 3. Resource that depends on unowned services
  const outgoing = new Map<string, string[]>();
  for (const rel of relationshipRows) {
    const list = outgoing.get(rel.sourceResourceId) ?? [];
    list.push(rel.targetResourceId);
    outgoing.set(rel.sourceResourceId, list);
  }
  const unownedSet = new Set(unowned.map((r) => r.id));
  let worstUnownedDep:
    | { resource: (typeof allResources)[number]; deps: string[] }
    | null = null;
  for (const [sourceId, deps] of outgoing) {
    const unownedDeps = deps.filter((d) => unownedSet.has(d));
    if (unownedDeps.length === 0) continue;
    const resource = resourcesById[sourceId];
    if (!resource) continue;
    if (!worstUnownedDep || unownedDeps.length > worstUnownedDep.deps.length) {
      worstUnownedDep = { resource, deps: unownedDeps };
    }
  }
  if (worstUnownedDep) {
    const count = worstUnownedDep.deps.length;
    insights.push({
      id: "unowned_dependency",
      type: "unowned_dependency",
      severity: count >= 2 ? "high" : "medium",
      icon: "GitBranch",
      headline: `${worstUnownedDep.resource.name} depends on ${count} ${
        count === 1 ? "service" : "services"
      } with no owner`,
      subtext:
        "A continuity risk surface — if those upstream services break, ownership of the response is unclear.",
      href: `/registry?resourceId=${worstUnownedDep.resource.id}`,
      ctaLabel: "Review dependency",
      metadata: {
        resourceId: worstUnownedDep.resource.id,
        dependencyIds: worstUnownedDep.deps,
      },
    });
  }

  // 4. Upcoming renewals in next 7 days
  const sevenDays = new Date();
  sevenDays.setDate(today.getDate() + 7);
  const sevenISO = sevenDays.toISOString().slice(0, 10);
  const upcoming = allResources.filter(
    (r) =>
      r.renewalDate &&
      r.renewalDate >= todayISO &&
      r.renewalDate <= sevenISO &&
      r.lifecycleState !== "archived"
  );
  if (upcoming.length > 0) {
    const monthlyAtStake = upcoming.reduce(
      (sum, r) => sum + (r.monthlyCost ?? 0),
      0
    );
    insights.push({
      id: "upcoming_renewals",
      type: "upcoming_renewals",
      severity: monthlyAtStake >= 200 ? "high" : "medium",
      icon: "CalendarClock",
      headline:
        upcoming.length === 1
          ? `1 subscription renews in the next 7 days — ${currency(
              monthlyAtStake,
              defaultCurrency
            )} at stake`
          : `${upcoming.length} subscriptions renew in the next 7 days — ${currency(
              monthlyAtStake,
              defaultCurrency
            )} at stake`,
      subtext: "Confirm continued use or cancel before the next billing cycle.",
      href: "/subscriptions",
      ctaLabel: "Open subscriptions",
      metadata: { resourceIds: upcoming.map((r) => r.id) },
    });
  }

  // 5. Single-vendor projects (≥3 active resources, all same vendorName)
  for (const project of allProjects) {
    const active = allResources.filter(
      (r) => r.projectId === project.id && r.lifecycleState !== "archived"
    );
    if (active.length < 3) continue;
    const vendors = new Set(
      active.map((r) => (r.vendorName ?? "").toLowerCase()).filter(Boolean)
    );
    if (vendors.size === 1) {
      const vendor = active.find((r) => r.vendorName)?.vendorName ?? "one vendor";
      insights.push({
        id: `single-vendor-${project.id}`,
        type: "single_vendor_project",
        severity: "medium",
        icon: "Building2",
        headline: `${project.name} depends entirely on ${vendor}`,
        subtext: `${active.length} active resources, all from ${vendor}. A pricing change or outage there is a project-level risk.`,
        href: `/projects/${project.id}`,
        ctaLabel: "Open project",
        metadata: { projectId: project.id, vendor },
      });
    }
  }

  // 6. Spend growth signal — vendor with month-over-month invoice climb
  const trendByVendor = new Map<string, Map<string, number>>();
  for (const inv of invoiceRows) {
    let key: string | null = null;
    if (inv.invoiceDate) key = inv.invoiceDate.slice(0, 7);
    else if (inv.billingPeriod && /^\d{4}-\d{2}/.test(inv.billingPeriod))
      key = inv.billingPeriod.slice(0, 7);
    if (!key) continue;
    const vendorMap = trendByVendor.get(inv.vendor) ?? new Map<string, number>();
    vendorMap.set(key, (vendorMap.get(key) ?? 0) + (inv.amount ?? 0));
    trendByVendor.set(inv.vendor, vendorMap);
  }
  let biggestGrowth:
    | { vendor: string; pct: number; oldest: number; latest: number }
    | null = null;
  for (const [vendor, months] of trendByVendor) {
    const sortedKeys = Array.from(months.keys()).sort();
    if (sortedKeys.length < 3) continue;
    const window = sortedKeys.slice(-3);
    const oldest = months.get(window[0]) ?? 0;
    const latest = months.get(window[window.length - 1]) ?? 0;
    if (oldest <= 0 || latest <= oldest) continue;
    const pct = ((latest - oldest) / oldest) * 100;
    if (pct < 25) continue;
    if (!biggestGrowth || pct > biggestGrowth.pct) {
      biggestGrowth = { vendor, pct, oldest, latest };
    }
  }
  if (biggestGrowth) {
    insights.push({
      id: "spend_growth",
      type: "spend_growth",
      severity: biggestGrowth.pct >= 50 ? "high" : "medium",
      icon: "TrendingUp",
      headline: `${biggestGrowth.vendor} spend climbed ${Math.round(
        biggestGrowth.pct
      )}% over 3 months`,
      subtext: `From ${currency(
        biggestGrowth.oldest,
        defaultCurrency
      )} to ${currency(
        biggestGrowth.latest,
        defaultCurrency
      )}/mo. Worth a quick usage review before the next invoice.`,
      href: "/finances",
      ctaLabel: "Review spend",
      metadata: { vendor: biggestGrowth.vendor, percent: biggestGrowth.pct },
    });
  }

  // 7. Waste — deprecated/archived still billing
  const wasteResources = allResources.filter(
    (r) =>
      (r.lifecycleState === "deprecated" || r.lifecycleState === "archived") &&
      (r.monthlyCost ?? 0) > 0
  );
  if (wasteResources.length > 0) {
    const annualWaste =
      wasteResources.reduce((sum, r) => sum + (r.monthlyCost ?? 0), 0) * 12;
    insights.push({
      id: "waste",
      type: "waste",
      severity: annualWaste >= 500 ? "high" : "medium",
      icon: "AlertTriangle",
      headline: `${wasteResources.length} deprecated ${
        wasteResources.length === 1 ? "service is" : "services are"
      } still billing — ${currency(annualWaste, defaultCurrency)}/yr at risk`,
      subtext:
        "Cancel before the next billing cycle or move them to archived once invoicing stops.",
      href: "/finances",
      ctaLabel: "Open finances",
      metadata: { resourceIds: wasteResources.map((r) => r.id) },
    });
  }

  // Sort insights: high → medium → low
  const SEVERITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  return insights;
}

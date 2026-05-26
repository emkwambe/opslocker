import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { SubscriptionsView } from "@/components/subscriptions/subscriptions-view";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const all = await getDb()
    .select()
    .from(resources)
    .where(eq(resources.workspaceId, workspace.id));

  const totalMonthlyCost = all
    .filter((r) => r.lifecycleState !== "archived")
    .reduce((sum, r) => sum + (r.monthlyCost ?? 0), 0);

  const byLifecycle: Record<string, number> = {
    active: 0,
    trial: 0,
    at_risk: 0,
    deprecated: 0,
    archived: 0,
  };
  for (const r of all) {
    byLifecycle[r.lifecycleState] = (byLifecycle[r.lifecycleState] ?? 0) + 1;
  }

  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 90);
  const horizonISO = horizon.toISOString().slice(0, 10);

  const upcomingRenewals = all
    .filter(
      (r) =>
        r.renewalDate &&
        r.renewalDate >= today &&
        r.renewalDate <= horizonISO &&
        r.lifecycleState !== "archived"
    )
    .sort((a, b) => (a.renewalDate ?? "").localeCompare(b.renewalDate ?? ""));

  const inactiveVendors = all
    .filter((r) => r.lifecycleState === "deprecated" || r.lifecycleState === "archived")
    .sort((a, b) => a.name.localeCompare(b.name));

  const spendByCategory: Record<string, number> = {};
  for (const r of all) {
    if (r.lifecycleState === "archived") continue;
    const cost = r.monthlyCost ?? 0;
    if (cost <= 0) continue;
    spendByCategory[r.category] = (spendByCategory[r.category] ?? 0) + cost;
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">Subscriptions</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Renewal risk, lifecycle health, and where your operational spend lives.
          </p>
        </div>
      </div>

      <SubscriptionsView
        summary={{
          totalMonthlyCost,
          byLifecycle,
          upcomingRenewals,
          inactiveVendors,
          spendByCategory,
          currency: all[0]?.currency ?? "USD",
        }}
      />
    </div>
  );
}

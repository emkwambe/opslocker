import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  CalendarClock,
  PlusCircle,
} from "lucide-react";
import {
  getDashboardMetrics,
  getDefaultWorkspace,
  getRecentActivity,
  getUpcomingRenewals,
} from "@/lib/db/queries";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RenewalRiskPanel } from "@/components/dashboard/renewal-risk-panel";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const [metrics, renewals, activity] = await Promise.all([
    getDashboardMetrics(workspace.id),
    getUpcomingRenewals(workspace.id),
    getRecentActivity(workspace.id),
  ]);

  const empty = metrics.totalResources === 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {workspace.name}
          </p>
          <h1 className="text-2xl font-semibold text-slate-100 mt-1">
            Operational Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Infrastructure and operational memory at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/registry">
            <PlusCircle className="w-4 h-4" /> Add resource
          </Link>
        </Button>
      </div>

      {empty ? (
        <EmptyDashboard />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total resources"
              value={metrics.totalResources}
              hint={`${formatCurrency(metrics.monthlySpend)}/mo tracked spend`}
              icon={Database}
            />
            <MetricCard
              label="Active"
              value={metrics.activeResources}
              hint={`${Math.round(
                (metrics.activeResources / Math.max(metrics.totalResources, 1)) * 100
              )}% of inventory`}
              icon={ShieldCheck}
              tone="positive"
            />
            <MetricCard
              label="At risk"
              value={metrics.atRiskResources}
              hint="Unclear ownership or deprecated"
              icon={AlertTriangle}
              tone={metrics.atRiskResources > 0 ? "warning" : "default"}
            />
            <MetricCard
              label="Renewals · 30d"
              value={metrics.upcomingRenewals}
              hint="Renewing in the next month"
              icon={CalendarClock}
              tone={metrics.upcomingRenewals > 0 ? "warning" : "default"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3">
              <RenewalRiskPanel resources={renewals} />
            </div>
            <div className="lg:col-span-2">
              <RecentActivityFeed events={activity} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
        <Database className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">
        Your operational memory is empty
      </h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        Register the first piece of infrastructure — a vendor, subscription, API, or
        domain — to start tracking ownership, renewals, and operational risk.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild>
          <Link href="/registry">
            <PlusCircle className="w-4 h-4" /> Add your first resource
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/projects">Create a project</Link>
        </Button>
      </div>
    </div>
  );
}

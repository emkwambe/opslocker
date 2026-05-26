"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  DollarSign,
  ShieldCheck,
  CalendarClock,
  Archive,
  ArrowUpRight,
  CircleDot,
  UserX,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LifecycleBadge } from "@/components/shared/badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const LifecycleBreakdownChart = dynamic(
  () =>
    import("@/components/subscriptions/lifecycle-breakdown-chart").then((m) => ({
      default: m.LifecycleBreakdownChart,
    })),
  {
    loading: () => <Skeleton className="h-56 w-full bg-[#1a1d26]" />,
    ssr: false,
  }
);

const SpendByCategoryChart = dynamic(
  () =>
    import("@/components/subscriptions/spend-by-category-chart").then((m) => ({
      default: m.SpendByCategoryChart,
    })),
  {
    loading: () => <Skeleton className="h-56 w-full bg-[#1a1d26]" />,
    ssr: false,
  }
);
import {
  cn,
  formatCurrency,
  formatDate,
  getDaysUntil,
  getRenewalSeverity,
  SEVERITY_COLORS,
} from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type SummaryData = {
  totalMonthlyCost: number;
  byLifecycle: Record<string, number>;
  upcomingRenewals: Resource[];
  inactiveVendors: Resource[];
  continuityRisk: Resource[];
  spendByCategory: Record<string, number>;
  currency: string;
};

type Props = { summary: SummaryData };

export function SubscriptionsView({ summary }: Props) {
  const renewals30d = summary.upcomingRenewals.filter((r) => {
    if (!r.renewalDate) return false;
    const days = getDaysUntil(r.renewalDate);
    return days >= 0 && days <= 30;
  }).length;

  const activeCount = summary.byLifecycle.active ?? 0;

  const totalAcross = Object.values(summary.byLifecycle).reduce((a, b) => a + b, 0);
  const empty = totalAcross === 0;

  if (empty) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-5">
      {summary.continuityRisk.length > 0 && (
        <ContinuityRiskPanel
          resources={summary.continuityRisk}
          currency={summary.currency}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Monthly spend"
          value={formatCurrency(summary.totalMonthlyCost, summary.currency)}
          hint="Across all non-archived resources"
          icon={DollarSign}
          tone={summary.totalMonthlyCost > 0 ? "default" : "default"}
        />
        <MetricCard
          label="Active subscriptions"
          value={activeCount}
          hint={`${activeCount} of ${totalAcross} resources active`}
          icon={ShieldCheck}
          tone="positive"
        />
        <MetricCard
          label="Renewals · 30 days"
          value={renewals30d}
          hint="Pay attention before they auto-charge"
          icon={CalendarClock}
          tone={renewals30d > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <RenewalTimeline
          className="lg:col-span-3"
          resources={summary.upcomingRenewals}
          currency={summary.currency}
        />
        <Card className="lg:col-span-2" title="Lifecycle breakdown" hint="By state">
          <LifecycleBreakdownChart byLifecycle={summary.byLifecycle} />
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 text-xs">
            {Object.entries({
              active: "Active",
              trial: "Trial",
              at_risk: "At risk",
              deprecated: "Deprecated",
              archived: "Archived",
            }).map(([k, label]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-200 tabular-nums">
                  {summary.byLifecycle[k] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card
          className="lg:col-span-3"
          title="Monthly spend by category"
          hint="Only non-archived resources"
        >
          <SpendByCategoryChart
            spendByCategory={summary.spendByCategory}
            currency={summary.currency}
          />
        </Card>
        <InactiveVendors
          className="lg:col-span-2"
          resources={summary.inactiveVendors}
          currency={summary.currency}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  hint,
  className,
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("rounded-xl border border-[#1e2028] bg-[#111318]", className)}
    >
      <header className="px-5 py-4 border-b border-[#1e2028] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function RenewalTimeline({
  resources,
  currency,
  className,
}: {
  resources: Resource[];
  currency: string;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-xl border border-[#1e2028] bg-[#111318]", className)}
    >
      <header className="px-5 py-4 border-b border-[#1e2028] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarClock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Renewals in next 90 days
          </h2>
        </div>
        <Link
          href="/timeline"
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          History <ArrowUpRight className="w-3 h-3" />
        </Link>
      </header>
      {resources.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-300 font-medium">No renewals coming up</p>
          <p className="text-xs text-slate-500 mt-1">
            Resources with renewal dates within 90 days surface here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#1e2028] max-h-[28rem] overflow-y-auto">
          {resources.map((r) => {
            const days = r.renewalDate ? getDaysUntil(r.renewalDate) : null;
            const severity = days === null ? "low" : getRenewalSeverity(days);
            const cost = r.monthlyCost ?? 0;
            return (
              <li
                key={r.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/registry?resourceId=${r.id}`}
                      className="text-sm font-medium text-slate-100 hover:text-white truncate transition-colors"
                    >
                      {r.name}
                    </Link>
                    {r.vendorName && (
                      <span className="text-xs text-slate-500 truncate">
                        · {r.vendorName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>
                      {r.renewalDate ? formatDate(r.renewalDate) : "No renewal date"}
                    </span>
                    {cost > 0 && (
                      <>
                        <span>·</span>
                        <span>{formatCurrency(cost, r.currency ?? currency)}/mo</span>
                      </>
                    )}
                    <span>·</span>
                    <LifecycleBadge state={r.lifecycleState} />
                  </div>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap",
                    SEVERITY_COLORS[severity]
                  )}
                >
                  {days === null
                    ? "—"
                    : days === 0
                    ? "Today"
                    : days < 0
                    ? `${Math.abs(days)}d overdue`
                    : `${days}d`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function InactiveVendors({
  resources,
  currency,
  className,
}: {
  resources: Resource[];
  currency: string;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-xl border border-[#1e2028] bg-[#111318]", className)}
    >
      <header className="px-5 py-4 border-b border-[#1e2028] flex items-center gap-2.5">
        <Archive className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-100">Inactive vendor review</h2>
      </header>
      {resources.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <CircleDot className="w-5 h-5 text-emerald-400 mx-auto" />
          <p className="text-sm text-slate-300 font-medium mt-3">
            No deprecated or archived resources
          </p>
          <p className="text-xs text-slate-500 mt-1">Your inventory is clean.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#1e2028]">
          {resources.map((r) => {
            const cost = r.monthlyCost ?? 0;
            return (
              <li
                key={r.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {r.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <LifecycleBadge state={r.lifecycleState} />
                    {cost > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {formatCurrency(cost, r.currency ?? currency)}/mo still billing
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="bg-[#0d0f14] border-[#1e2028]"
                >
                  <Link href={`/registry?resourceId=${r.id}`}>Review</Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ContinuityRiskPanel({
  resources,
  currency,
}: {
  resources: Resource[];
  currency: string;
}) {
  const totalMonthly = resources.reduce((s, r) => s + (r.monthlyCost ?? 0), 0);
  return (
    <section className="rounded-xl border border-red-500/30 bg-red-500/[0.04]">
      <header className="px-5 py-4 border-b border-red-500/20 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <UserX className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-slate-100">Continuity risk</h2>
          <span className="text-xs text-red-200/80">
            {resources.length} active{" "}
            {resources.length === 1 ? "resource has" : "resources have"} no operational
            owner
          </span>
        </div>
        {totalMonthly > 0 && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-red-300/80">
              Unowned spend
            </p>
            <p className="text-sm font-semibold text-red-200 tabular-nums">
              {formatCurrency(totalMonthly, currency)}/mo
            </p>
          </div>
        )}
      </header>
      <div className="px-5 py-3.5 border-b border-red-500/10">
        <p className="text-xs text-red-200/80 leading-relaxed">
          If these vendors need attention, nobody will know — assign owners before any of
          them break or renew.
        </p>
      </div>
      <ul className="divide-y divide-red-500/10">
        {resources.map((r) => {
          const cost = r.monthlyCost ?? 0;
          return (
            <li
              key={r.id}
              className="px-5 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-100 truncate">{r.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                  {r.vendorName && <span>{r.vendorName}</span>}
                  {r.vendorName && cost > 0 && <span>·</span>}
                  {cost > 0 && (
                    <span>{formatCurrency(cost, r.currency ?? currency)}/mo</span>
                  )}
                  <span>·</span>
                  <span className="capitalize">
                    {r.category.replace("_", "/")}
                  </span>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-[#0d0f14] border-red-500/20 hover:border-red-500/40"
              >
                <Link href={`/registry?resourceId=${r.id}`}>Assign owner</Link>
              </Button>
            </li>
          );
        })}
      </ul>
      <div className="px-5 py-3 border-t border-red-500/10">
        <Link
          href="/registry"
          className="text-xs text-red-200 hover:text-red-100 inline-flex items-center gap-1 transition-colors"
        >
          Assign owners in Registry <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
        <DollarSign className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">
        No subscriptions to summarize yet
      </h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        Once you register vendors with renewal dates and monthly costs, this view shows
        spend, renewals, and inactive vendors at a glance.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/registry">Add a subscription</Link>
        </Button>
      </div>
    </div>
  );
}

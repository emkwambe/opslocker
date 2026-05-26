"use client";

import { DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { VendorSpendTable } from "@/components/finances/vendor-spend-table";
import { SpendByCategoryChart } from "@/components/finances/spend-by-category-chart";
import { SpendByProjectChart } from "@/components/finances/spend-by-project-chart";
import { MonthlyTrendChart } from "@/components/finances/monthly-trend-chart";
import { WasteSignalsPanel } from "@/components/finances/waste-signals-panel";
import { InvoiceList } from "@/components/finances/invoice-list";
import { cn, formatCurrency } from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type Summary = {
  totalMonthlyCost: number;
  totalAnnualProjected: number;
  byCategory: { category: string; monthlyCost: number; resourceCount: number }[];
  byProject: {
    projectId: string;
    projectName: string;
    projectColor: string | null;
    monthlyCost: number;
    resourceCount: number;
  }[];
  monthlyTrend: { month: string; label: string; total: number }[];
  wasteSignals: {
    id: string;
    name: string;
    vendorName: string | null;
    monthlyCost: number;
    currency: string;
    lifecycleState: string;
  }[];
  currency: string;
};

type InvoiceRow = {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceVendor: string | null;
  vendor: string;
  amount: number;
  currency: string | null;
  billingPeriod: string | null;
  invoiceDate: string | null;
  notes: string | null;
};

type Props = {
  summary: Summary;
  resources: (Resource & { projectName: string; projectColor: string | null })[];
  invoices: InvoiceRow[];
  resourceOptions: { id: string; name: string; vendorName: string | null }[];
};

export function FinancesView({ summary, resources, invoices, resourceOptions }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Monthly spend"
          value={formatCurrency(summary.totalMonthlyCost, summary.currency)}
          hint="Sum across non-archived resources"
          icon={DollarSign}
        />
        <MetricCard
          label="Annual projected"
          value={formatCurrency(summary.totalAnnualProjected, summary.currency)}
          hint="Monthly × 12 forecast"
          icon={Calendar}
        />
        <MetricCard
          label="Waste signals"
          value={summary.wasteSignals.length}
          hint={
            summary.wasteSignals.length > 0
              ? `${formatCurrency(
                  summary.wasteSignals.reduce((s, w) => s + w.monthlyCost, 0) * 12,
                  summary.currency
                )}/yr at risk`
              : "Clean inventory"
          }
          icon={AlertTriangle}
          tone={summary.wasteSignals.length > 0 ? "warning" : "positive"}
        />
      </div>

      <Section title="Vendor spend" hint="Sorted by monthly cost · click a resource to inspect">
        <VendorSpendTable resources={resources} currency={summary.currency} />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card title="Spend by category" hint="Active resources" className="lg:col-span-3">
          <SpendByCategoryChart data={summary.byCategory} currency={summary.currency} />
        </Card>
        <Card title="Spend by project" hint="Active resources" className="lg:col-span-2">
          <SpendByProjectChart data={summary.byProject} currency={summary.currency} />
        </Card>
      </div>

      <Card title="Monthly trend" hint="Last 6 months · from recorded invoices">
        <MonthlyTrendChart data={summary.monthlyTrend} currency={summary.currency} />
      </Card>

      <WasteSignalsPanel
        signals={summary.wasteSignals}
        currency={summary.currency}
      />

      <InvoiceList invoices={invoices} resources={resourceOptions} />
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      {children}
    </section>
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

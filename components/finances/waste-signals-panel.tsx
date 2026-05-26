"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LifecycleBadge } from "@/components/shared/badges";
import { formatCurrency } from "@/lib/utils";

type Signal = {
  id: string;
  name: string;
  vendorName: string | null;
  monthlyCost: number;
  currency: string;
  lifecycleState: string;
};

type Props = {
  signals: Signal[];
  currency: string;
};

export function WasteSignalsPanel({ signals, currency }: Props) {
  if (signals.length === 0) {
    return (
      <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
        <header className="px-5 py-4 border-b border-emerald-500/20 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">Waste signals</h2>
        </header>
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-200 font-medium">
            No waste signals detected
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Your infrastructure looks clean — nothing deprecated is still billing.
          </p>
        </div>
      </section>
    );
  }

  const totalMonthly = signals.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalAnnual = totalMonthly * 12;

  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04]">
      <header className="px-5 py-4 border-b border-amber-500/20 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-100">Waste signals</h2>
          <span className="text-xs text-amber-200/80">
            {signals.length} deprecated or archived resource{signals.length === 1 ? "" : "s"} still billing
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-amber-300/80">
            Estimated annual waste
          </p>
          <p className="text-lg font-semibold text-amber-200 tabular-nums">
            {formatCurrency(totalAnnual, currency)}
          </p>
        </div>
      </header>
      <ul className="divide-y divide-amber-500/10">
        {signals.map((s) => (
          <li
            key={s.id}
            className="px-5 py-3.5 flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-100 truncate">{s.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                {s.vendorName && <span>{s.vendorName}</span>}
                {s.vendorName && <span>·</span>}
                <span className="text-amber-200">
                  {formatCurrency(s.monthlyCost, s.currency ?? currency)}/mo still billing
                </span>
                <span>·</span>
                <LifecycleBadge state={s.lifecycleState} />
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-[#0d0f14] border-amber-500/20 hover:border-amber-500/40"
            >
              <Link href={`/registry?resourceId=${s.id}`}>Review</Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

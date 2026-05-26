import Link from "next/link";
import { CalendarClock, ArrowUpRight } from "lucide-react";
import { cn, formatCurrency, formatDate, getDaysUntil, getRenewalSeverity, SEVERITY_COLORS } from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type Props = { resources: Resource[] };

export function RenewalRiskPanel({ resources }: Props) {
  return (
    <section className="rounded-xl border border-[#1e2028] bg-[#111318]">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[#1e2028]">
        <div className="flex items-center gap-2.5">
          <CalendarClock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-100">Renewal risk</h2>
        </div>
        <Link
          href="/subscriptions"
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </header>

      {resources.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-300 font-medium">No renewals on the horizon</p>
          <p className="text-xs text-slate-500 mt-1">
            Add renewal dates to subscriptions to see them surface here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#1e2028]">
          {resources.map((r) => {
            const days = r.renewalDate ? getDaysUntil(r.renewalDate) : null;
            const severity = days === null ? "low" : getRenewalSeverity(days);
            const monthlyCost = r.monthlyCost ?? 0;
            return (
              <li key={r.id} className="flex items-center justify-between px-5 py-3.5 group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-100 truncate">{r.name}</p>
                    {r.vendorName && (
                      <span className="text-xs text-slate-500 truncate">· {r.vendorName}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.renewalDate ? formatDate(r.renewalDate) : "No renewal date"}
                    {monthlyCost > 0 && ` · ${formatCurrency(monthlyCost, r.currency ?? "USD")}/mo`}
                  </p>
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

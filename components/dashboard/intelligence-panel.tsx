import Link from "next/link";
import {
  UserX,
  Clock,
  GitBranch,
  CalendarClock,
  Building2,
  TrendingUp,
  AlertTriangle,
  Brain,
  ArrowUpRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/db/intelligence";

const ICONS: Record<string, LucideIcon> = {
  UserX,
  Clock,
  GitBranch,
  CalendarClock,
  Building2,
  TrendingUp,
  AlertTriangle,
};

const SEVERITY_STYLES: Record<
  Insight["severity"],
  { dot: string; ring: string; iconTone: string; cta: string }
> = {
  high: {
    dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
    ring: "border-red-500/30 hover:border-red-500/50",
    iconTone: "text-red-400 bg-red-500/10 border-red-500/20",
    cta: "text-red-200 hover:text-red-100",
  },
  medium: {
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
    ring: "border-amber-500/30 hover:border-amber-500/50",
    iconTone: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    cta: "text-amber-200 hover:text-amber-100",
  },
  low: {
    dot: "bg-emerald-400",
    ring: "border-[#1e2028] hover:border-[#2a2d38]",
    iconTone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cta: "text-emerald-200 hover:text-emerald-100",
  },
};

export function IntelligencePanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-5 py-6 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-slate-100">
            No operational risks detected
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Ownership, lifecycle, renewals, and spend all look healthy in this workspace.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Brain className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-100">
            Operational intelligence
          </h2>
          <span className="text-xs text-slate-500">
            {insights.length} signal{insights.length === 1 ? "" : "s"} from your inventory
          </span>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </ul>
    </section>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const Icon = ICONS[insight.icon] ?? AlertTriangle;
  const styles = SEVERITY_STYLES[insight.severity];

  return (
    <li>
      <Link
        href={insight.href}
        className={cn(
          "block rounded-xl border bg-[#111318] p-4 transition-colors group h-full",
          styles.ring
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-md border flex items-center justify-center shrink-0",
              styles.iconTone
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                {insight.severity === "high"
                  ? "High priority"
                  : insight.severity === "medium"
                  ? "Worth a look"
                  : "Informational"}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-100 mt-1 leading-snug">
              {insight.headline}
            </p>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {insight.subtext}
            </p>
            <p
              className={cn(
                "text-xs mt-3 inline-flex items-center gap-1 transition-colors",
                styles.cta
              )}
            >
              {insight.ctaLabel}
              <ArrowUpRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

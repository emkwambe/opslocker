import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "positive" | "warning" | "critical";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
};

const TONE_RING: Record<Tone, string> = {
  default: "text-slate-300 bg-[#1a1d26]",
  positive: "text-emerald-400 bg-emerald-400/10",
  warning: "text-amber-400 bg-amber-400/10",
  critical: "text-red-400 bg-red-400/10",
};

export function MetricCard({ label, value, hint, icon: Icon, tone = "default" }: Props) {
  return (
    <div className="rounded-xl border border-[#1e2028] bg-[#111318] p-5 flex flex-col gap-3 transition-colors hover:border-[#2a2d38]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center",
            TONE_RING[tone]
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-100 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

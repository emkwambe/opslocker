import { Loader2 } from "lucide-react";

export function GraphContentSkeleton() {
  return (
    <div className="relative rounded-xl border border-[#1e2028] bg-[#0a0b0e] h-[calc(100vh-12rem)] min-h-[520px] overflow-hidden flex items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        <p className="text-xs text-slate-500">Loading dependency graph…</p>
      </div>
    </div>
  );
}

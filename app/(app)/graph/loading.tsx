import { Loader2 } from "lucide-react";
import { PageHeaderSkeleton } from "@/components/shared/skeletons";

export default function GraphLoading() {
  return (
    <div className="space-y-4 max-w-[1400px]">
      <PageHeaderSkeleton />

      <div className="relative rounded-xl border border-[#1e2028] bg-[#0a0b0e] h-[calc(100vh-12rem)] min-h-[520px] overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
          <p className="text-xs text-slate-500">Laying out dependencies…</p>
        </div>
      </div>
    </div>
  );
}

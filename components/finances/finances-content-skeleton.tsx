import {
  MetricCardSkeleton,
  ChartPanelSkeleton,
  PanelSkeleton,
} from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export function FinancesContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3 w-32 bg-[#1a1d26]" />
        <div className="rounded-xl border border-[#1e2028] bg-[#111318]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-[#1e2028] last:border-b-0"
            >
              <Skeleton className="h-3 w-28 bg-[#1a1d26]" />
              <Skeleton className="h-3 w-32 bg-[#1a1d26]" />
              <Skeleton className="h-3 w-20 bg-[#1a1d26]" />
              <Skeleton className="h-5 w-16 rounded-md bg-[#1a1d26]" />
              <Skeleton className="h-3 w-16 ml-auto bg-[#1a1d26]" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ChartPanelSkeleton height={220} />
        </div>
        <div className="lg:col-span-2">
          <ChartPanelSkeleton height={220} />
        </div>
      </div>

      <ChartPanelSkeleton height={200} />

      <PanelSkeleton rows={3} />
    </div>
  );
}

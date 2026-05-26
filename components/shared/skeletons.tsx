import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-32 bg-[#1a1d26]" />
      <Skeleton className="h-7 w-56 bg-[#1a1d26]" />
      <Skeleton className="h-4 w-72 bg-[#1a1d26]" />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#1e2028] bg-[#111318] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 bg-[#1a1d26]" />
        <Skeleton className="h-7 w-7 rounded-md bg-[#1a1d26]" />
      </div>
      <Skeleton className="h-7 w-16 bg-[#1a1d26]" />
      <Skeleton className="h-3 w-32 bg-[#1a1d26]" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 7 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[#1e2028] last:border-b-0">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3 bg-[#1a1d26]",
            i === 0 ? "w-32" : i === cols - 1 ? "w-16" : "w-24"
          )}
        />
      ))}
    </div>
  );
}

export function ChartPanelSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-[#1e2028] bg-[#111318] p-5">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-3 w-32 bg-[#1a1d26]" />
        <Skeleton className="h-3 w-20 bg-[#1a1d26]" />
      </div>
      <Skeleton
        className="w-full bg-[#1a1d26]"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}

export function PanelSkeleton({ rows = 5, title = true }: { rows?: number; title?: boolean }) {
  return (
    <div className="rounded-xl border border-[#1e2028] bg-[#111318] overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-[#1e2028]">
          <Skeleton className="h-3 w-32 bg-[#1a1d26]" />
        </div>
      )}
      <div className="divide-y divide-[#1e2028]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-40 bg-[#1a1d26]" />
              <Skeleton className="h-2.5 w-56 bg-[#1a1d26]" />
            </div>
            <Skeleton className="h-5 w-14 rounded-md bg-[#1a1d26]" />
          </div>
        ))}
      </div>
    </div>
  );
}

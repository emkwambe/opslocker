import { PageHeaderSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegistryLoading() {
  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeaderSkeleton />

      <div className="flex items-center gap-3 flex-wrap">
        <Skeleton className="h-9 flex-1 min-w-[200px] bg-[#1a1d26]" />
        <Skeleton className="h-9 w-32 bg-[#1a1d26]" />
        <Skeleton className="h-9 w-32 bg-[#1a1d26]" />
        <Skeleton className="h-9 w-32 bg-[#1a1d26]" />
        <Skeleton className="h-9 w-32 bg-[#1a1d26]" />
        <Skeleton className="h-9 w-24 bg-[#1a1d26]" />
        <Skeleton className="h-9 w-32 bg-[#1a1d26]" />
      </div>

      <div className="rounded-xl border border-[#1e2028] bg-[#111318]">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#1e2028]">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-20 bg-[#1a1d26]" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-[#1e2028] last:border-b-0"
          >
            <div className="space-y-1.5 w-40">
              <Skeleton className="h-3 w-32 bg-[#1a1d26]" />
              <Skeleton className="h-2.5 w-20 bg-[#1a1d26]" />
            </div>
            <Skeleton className="h-3 w-24 bg-[#1a1d26]" />
            <Skeleton className="h-3 w-20 bg-[#1a1d26]" />
            <Skeleton className="h-3 w-24 bg-[#1a1d26]" />
            <Skeleton className="h-5 w-16 rounded-md bg-[#1a1d26]" />
            <Skeleton className="h-5 w-20 rounded-md bg-[#1a1d26]" />
            <Skeleton className="h-3 w-24 ml-auto bg-[#1a1d26]" />
            <Skeleton className="h-3 w-16 bg-[#1a1d26]" />
          </div>
        ))}
      </div>
    </div>
  );
}

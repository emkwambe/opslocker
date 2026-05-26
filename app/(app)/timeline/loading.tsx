import { PageHeaderSkeleton } from "@/components/shared/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimelineLoading() {
  return (
    <div className="space-y-5 max-w-5xl">
      <PageHeaderSkeleton />

      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-full max-w-md bg-[#1a1d26]" />
        <Skeleton className="h-9 w-28 bg-[#1a1d26]" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, group) => (
          <section key={group} className="space-y-2">
            <Skeleton className="h-2.5 w-24 bg-[#1a1d26]" />
            <div className="rounded-xl border border-[#1e2028] bg-[#111318]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-5 py-3.5 border-b border-[#1e2028] last:border-b-0"
                >
                  <Skeleton className="h-7 w-7 rounded-md bg-[#1a1d26]" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4 bg-[#1a1d26]" />
                    <Skeleton className="h-2.5 w-1/2 bg-[#1a1d26]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

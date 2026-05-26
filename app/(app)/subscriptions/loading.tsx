import {
  PageHeaderSkeleton,
  MetricCardSkeleton,
  ChartPanelSkeleton,
  PanelSkeleton,
} from "@/components/shared/skeletons";

export default function SubscriptionsLoading() {
  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <PanelSkeleton rows={6} />
        </div>
        <div className="lg:col-span-2">
          <ChartPanelSkeleton height={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ChartPanelSkeleton height={220} />
        </div>
        <div className="lg:col-span-2">
          <PanelSkeleton rows={3} />
        </div>
      </div>
    </div>
  );
}

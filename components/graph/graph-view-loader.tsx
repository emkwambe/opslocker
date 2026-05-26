"use client";

import dynamic from "next/dynamic";
import { GraphContentSkeleton } from "@/components/graph/graph-content-skeleton";
import type { ComponentProps } from "react";
import type { GraphView as GraphViewType } from "@/components/graph/graph-view";

const GraphView = dynamic(
  () =>
    import("@/components/graph/graph-view").then((m) => ({
      default: m.GraphView,
    })),
  {
    loading: () => <GraphContentSkeleton />,
    ssr: false,
  }
);

type Props = ComponentProps<typeof GraphViewType>;

export function GraphViewLoader(props: Props) {
  return <GraphView {...props} />;
}

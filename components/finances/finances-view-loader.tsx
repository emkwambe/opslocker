"use client";

import dynamic from "next/dynamic";
import { FinancesContentSkeleton } from "@/components/finances/finances-content-skeleton";
import type { ComponentProps } from "react";
import type { FinancesView as FinancesViewType } from "@/components/finances/finances-view";

const FinancesView = dynamic(
  () =>
    import("@/components/finances/finances-view").then((m) => ({
      default: m.FinancesView,
    })),
  {
    loading: () => <FinancesContentSkeleton />,
    ssr: false,
  }
);

type Props = ComponentProps<typeof FinancesViewType>;

export function FinancesViewLoader(props: Props) {
  return <FinancesView {...props} />;
}

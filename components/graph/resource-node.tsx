"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  Database,
  Globe,
  Cloud,
  KeyRound,
  Cog,
  BarChart3,
  Mail,
  HardDrive,
  Activity,
  DollarSign,
  Layers,
  ServerCog,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LifecycleBadge } from "@/components/shared/badges";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  database: Database,
  api: ServerCog,
  domain: Globe,
  cloud: Cloud,
  auth: KeyRound,
  ci_cd: Cog,
  analytics: BarChart3,
  communication: Mail,
  storage: HardDrive,
  monitoring: Activity,
  subscription: DollarSign,
  other: Layers,
};

const LIFECYCLE_RING: Record<string, string> = {
  active: "border-emerald-500/40 hover:border-emerald-400/70",
  trial: "border-blue-500/40 hover:border-blue-400/70",
  at_risk: "border-amber-500/40 hover:border-amber-400/70",
  deprecated: "border-orange-500/40 hover:border-orange-400/70",
  archived: "border-zinc-500/30 hover:border-zinc-400/60",
};

export type ResourceNodeData = {
  name: string;
  vendorName: string | null;
  category: string;
  lifecycleState: string;
  isOrphan: boolean;
};

function ResourceNodeImpl({
  data,
  selected,
}: {
  data: ResourceNodeData;
  selected?: boolean;
}) {
  const Icon = CATEGORY_ICON[data.category] ?? Layers;
  return (
    <div
      className={cn(
        "rounded-xl border bg-[#111318] px-3 py-2.5 w-[240px] shadow-sm transition-colors cursor-pointer",
        LIFECYCLE_RING[data.lifecycleState] ?? "border-[#1e2028]",
        data.isOrphan && "border-dashed border-red-500/60 bg-red-500/[0.04]",
        selected && "ring-1 ring-blue-400/60"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#1e2028", border: "1px solid #1e2028", width: 6, height: 6 }}
      />
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-md bg-[#1a1d26] border border-[#1e2028] flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100 truncate leading-tight">
            {data.name}
          </p>
          <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
            {data.vendorName ?? data.category.replace("_", "/")}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-1.5">
        <LifecycleBadge state={data.lifecycleState} />
        {data.isOrphan && (
          <span className="text-[10px] font-medium text-red-300 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5">
            Orphan
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#1e2028", border: "1px solid #1e2028", width: 6, height: 6 }}
      />
    </div>
  );
}

export const ResourceNode = memo(ResourceNodeImpl);

"use client";

import Link from "next/link";
import { PlusCircle, Upload, GitBranch } from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";

export function QuickActions() {
  const setNewResourceOpen = useUIStore((s) => s.setNewResourceOpen);
  const setImportOpen = useUIStore((s) => s.setImportOpen);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <ActionButton
        onClick={() => setNewResourceOpen(true)}
        icon={PlusCircle}
        title="Create resource"
        hint="Register a vendor, API, or subscription"
      />
      <ActionButton
        onClick={() => setImportOpen(true)}
        icon={Upload}
        title="Import"
        hint="Bring in resources from CSV or .env"
      />
      <ActionButton
        as={Link}
        href="/graph"
        icon={GitBranch}
        title="View graph"
        hint="See dependencies and orphans"
      />
    </div>
  );
}

type ButtonProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
} & (
  | { onClick: () => void; as?: undefined; href?: undefined }
  | { as: typeof Link; href: string; onClick?: undefined }
);

function ActionButton(props: ButtonProps) {
  const Icon = props.icon;
  const className = cn(
    "group flex items-center gap-3 text-left rounded-xl border border-[#1e2028] bg-[#111318] px-4 py-3 hover:bg-[#13161d] hover:border-[#2a2d38] transition-colors"
  );
  const content = (
    <>
      <div className="w-9 h-9 rounded-md bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600/15">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-100">{props.title}</p>
        <p className="text-xs text-slate-500 truncate">{props.hint}</p>
      </div>
    </>
  );

  if (props.as) {
    return (
      <Link href={props.href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={props.onClick} className={className}>
      {content}
    </button>
  );
}

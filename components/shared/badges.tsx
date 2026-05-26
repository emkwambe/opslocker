import { cn, LIFECYCLE_COLORS, SEVERITY_COLORS } from "@/lib/utils";

const LIFECYCLE_LABEL: Record<string, string> = {
  active: "Active",
  trial: "Trial",
  at_risk: "At risk",
  deprecated: "Deprecated",
  archived: "Archived",
};

export function LifecycleBadge({ state }: { state: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap",
        LIFECYCLE_COLORS[state] ?? "text-slate-400 bg-slate-400/10 border-slate-400/20"
      )}
    >
      {LIFECYCLE_LABEL[state] ?? state}
    </span>
  );
}

const ENVIRONMENT_COLORS: Record<string, string> = {
  production: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  staging: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  development: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  all: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

export function EnvironmentBadge({ environment }: { environment: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap",
        ENVIRONMENT_COLORS[environment] ?? "text-slate-400 bg-slate-400/10 border-slate-400/20"
      )}
    >
      {environment === "all" ? "All envs" : environment}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border whitespace-nowrap capitalize",
        SEVERITY_COLORS[severity] ?? "text-slate-400 bg-slate-400/10 border-slate-400/20"
      )}
    >
      {severity}
    </span>
  );
}

export function CategoryPill({ category }: { category: string }) {
  return (
    <span className="text-xs text-slate-400 capitalize">{category.replace("_", "/")}</span>
  );
}

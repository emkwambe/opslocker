"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, Database, FolderOpen, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LifecycleBadge } from "@/components/shared/badges";
import { cn, formatCurrency } from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type Props = {
  resources: Resource[];
  projects: { id: string; name: string }[];
};

const CATEGORIES = [
  { value: "database", label: "Database" },
  { value: "api", label: "API" },
  { value: "domain", label: "Domain" },
  { value: "cloud", label: "Cloud" },
  { value: "auth", label: "Auth" },
  { value: "ci_cd", label: "CI/CD" },
  { value: "analytics", label: "Analytics" },
  { value: "communication", label: "Communication" },
  { value: "storage", label: "Storage" },
  { value: "monitoring", label: "Monitoring" },
  { value: "subscription", label: "Subscription" },
  { value: "other", label: "Other" },
];

const LIFECYCLE = [
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "at_risk", label: "At risk" },
  { value: "deprecated", label: "Deprecated" },
  { value: "archived", label: "Archived" },
];

export function SearchView({ resources, projects }: Props) {
  const projectsById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  );

  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [activeLifecycles, setActiveLifecycles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(rawQuery), 150);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const deferredQuery = useDeferredValue(debouncedQuery);

  const haystacks = useMemo(
    () =>
      resources.map((r) => ({
        resource: r,
        haystack: [
          r.name,
          r.vendorName,
          r.owner,
          r.notes,
          ...(r.tags ?? []),
          projectsById[r.projectId] ?? "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      })),
    [resources, projectsById]
  );

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return haystacks.filter(({ resource, haystack }) => {
      if (q && !haystack.includes(q)) return false;
      if (activeCategories.size > 0 && !activeCategories.has(resource.category))
        return false;
      if (activeLifecycles.size > 0 && !activeLifecycles.has(resource.lifecycleState))
        return false;
      return true;
    }).map(({ resource }) => resource);
  }, [haystacks, deferredQuery, activeCategories, activeLifecycles]);

  const toggleSetItem = (set: Set<string>, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const hasActiveFilters =
    rawQuery.length > 0 || activeCategories.size > 0 || activeLifecycles.size > 0;

  const clearAll = () => {
    setRawQuery("");
    setActiveCategories(new Set());
    setActiveLifecycles(new Set());
  };

  if (resources.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
          <SearchIcon className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100 mt-4">
          Nothing to search yet
        </h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Add resources to your registry and they&apos;ll be searchable here by name,
          vendor, owner, notes, or tag.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/registry">Open registry</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search by name, vendor, owner, notes, tag…"
            className="pl-10 pr-10 h-11 text-base bg-[#111318] border-[#1e2028]"
            autoFocus
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => setRawQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Lifecycle:</span>
          {LIFECYCLE.map((l) => (
            <Chip
              key={l.value}
              active={activeLifecycles.has(l.value)}
              onClick={() =>
                setActiveLifecycles((prev) => toggleSetItem(prev, l.value))
              }
            >
              {l.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Category:</span>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              active={activeCategories.has(c.value)}
              onClick={() =>
                setActiveCategories((prev) => toggleSetItem(prev, c.value))
              }
            >
              {c.label}
            </Chip>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500">
            <span className="text-slate-300">{resources.length}</span> resources ·{" "}
            <span className="text-slate-300">{results.length}</span> matching
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear search and filters
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
          <SearchIcon className="w-5 h-5 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-300 font-medium mt-3">
            No resources match your search
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try a different query or clear the filters.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((r) => (
            <ResultCard
              key={r.id}
              resource={r}
              projectName={projectsById[r.projectId] ?? "—"}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-xs px-2.5 py-1 rounded-md border transition-colors",
        active
          ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
          : "border-[#1e2028] bg-[#111318] text-slate-400 hover:text-slate-200 hover:border-[#2a2d38]"
      )}
    >
      {children}
    </button>
  );
}

function ResultCard({
  resource,
  projectName,
}: {
  resource: Resource;
  projectName: string;
}) {
  const cost = resource.monthlyCost ?? 0;
  return (
    <li>
      <Link
        href={`/registry?resourceId=${resource.id}`}
        className="block rounded-xl border border-[#1e2028] bg-[#111318] p-4 hover:border-[#2a2d38] hover:bg-[#13161d] transition-colors group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-white">
              {resource.name}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {resource.vendorName ?? "—"}
              {resource.vendorName && " · "}
              <span className="capitalize">
                {resource.category.replace("_", "/")}
              </span>
            </p>
          </div>
          <LifecycleBadge state={resource.lifecycleState} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
            <FolderOpen className="w-3 h-3 shrink-0" />
            <span className="truncate text-slate-300">{projectName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate text-slate-300">{resource.owner ?? "—"}</span>
          </div>
          {cost > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500 min-w-0 col-span-2">
              <Database className="w-3 h-3 shrink-0" />
              <span className="text-slate-300 tabular-nums">
                {formatCurrency(cost, resource.currency ?? "USD")}/mo
              </span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}

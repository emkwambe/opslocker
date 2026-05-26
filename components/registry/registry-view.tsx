"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { PlusCircle, Search as SearchIcon, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LifecycleBadge, EnvironmentBadge } from "@/components/shared/badges";
import { ResourceForm } from "@/components/registry/resource-form";
import { ResourceDetailSheet } from "@/components/registry/resource-detail-sheet";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useUIStore } from "@/store";
import { Upload } from "lucide-react";
import type { Resource } from "@/lib/schema";

type Props = {
  workspaceId: string;
  resources: Resource[];
  projects: { id: string; name: string }[];
  scopedProjectId?: string;
};

const ALL = "__all__";

export function RegistryView({ workspaceId, resources, projects, scopedProjectId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deepLinkedId = searchParams.get("resourceId");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(deepLinkedId);

  useEffect(() => {
    if (deepLinkedId && deepLinkedId !== selectedId) {
      setSelectedId(deepLinkedId);
    }
    // intentionally not depending on selectedId — only react to URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkedId]);

  const closeDrawer = () => {
    setSelectedId(null);
    if (searchParams.has("resourceId")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("resourceId");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }
  };
  const [globalFilter, setGlobalFilter] = useState("");
  const [lifecycle, setLifecycle] = useState<string>(ALL);
  const [category, setCategory] = useState<string>(ALL);
  const [environment, setEnvironment] = useState<string>(ALL);
  const [owner, setOwner] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);

  const projectNameById = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  );

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (lifecycle !== ALL && r.lifecycleState !== lifecycle) return false;
      if (category !== ALL && r.category !== category) return false;
      if (environment !== ALL && r.environment !== environment) return false;
      if (owner.trim() && !(r.owner ?? "").toLowerCase().includes(owner.toLowerCase()))
        return false;
      return true;
    });
  }, [resources, lifecycle, category, environment, owner]);

  const columns = useMemo<ColumnDef<Resource>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-100 truncate">{row.original.name}</div>
            <div className="text-xs text-slate-500 truncate">
              {projectNameById[row.original.projectId] ?? "—"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "vendorName",
        header: "Vendor",
        cell: ({ getValue }) => (
          <span className="text-sm text-slate-300">{(getValue() as string) || "—"}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <span className="text-sm text-slate-300 capitalize">
            {String(getValue() ?? "").replace("_", "/")}
          </span>
        ),
      },
      {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ getValue }) => (
          <span className="text-sm text-slate-300">{(getValue() as string) || "—"}</span>
        ),
      },
      {
        accessorKey: "lifecycleState",
        header: "Lifecycle",
        cell: ({ getValue }) => <LifecycleBadge state={String(getValue() ?? "active")} />,
      },
      {
        accessorKey: "environment",
        header: "Environment",
        cell: ({ getValue }) => (
          <EnvironmentBadge environment={String(getValue() ?? "production")} />
        ),
      },
      {
        accessorKey: "renewalDate",
        header: "Renewal",
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return (
            <span className="text-sm text-slate-300 tabular-nums">
              {v ? formatDate(v) : "—"}
            </span>
          );
        },
        sortingFn: (a, b) => {
          const av = a.original.renewalDate ?? "9999-12-31";
          const bv = b.original.renewalDate ?? "9999-12-31";
          return av.localeCompare(bv);
        },
      },
      {
        accessorKey: "monthlyCost",
        header: "Cost",
        cell: ({ row }) => {
          const cost = row.original.monthlyCost ?? 0;
          return (
            <span className="text-sm text-slate-300 tabular-nums">
              {cost > 0 ? `${formatCurrency(cost, row.original.currency ?? "USD")}/mo` : "—"}
            </span>
          );
        },
      },
      { accessorKey: "updatedAt", header: "", cell: () => null },
    ],
    [projectNameById]
  );

  const table = useReactTable({
    data: filteredResources,
    columns,
    state: { globalFilter, sorting, columnVisibility: { updatedAt: false } },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, value) => {
      const q = String(value).toLowerCase().trim();
      if (!q) return true;
      const r = row.original;
      return [r.name, r.vendorName, r.owner, r.notes, r.category]
        .map((s) => (s ?? "").toLowerCase())
        .some((s) => s.includes(q));
    },
  });

  const onCreated = () => {
    setCreateOpen(false);
    router.refresh();
  };

  const onMutated = () => {
    router.refresh();
  };

  const onDeleted = () => {
    closeDrawer();
    router.refresh();
  };

  const setImportOpen = useUIStore((s) => s.setImportOpen);

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            placeholder="Search by name, vendor, owner, notes…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-[#111318] border-[#1e2028]"
          />
        </div>
        <Filter label="Lifecycle" value={lifecycle} onValueChange={setLifecycle} options={[
          { value: ALL, label: "All" },
          { value: "active", label: "Active" },
          { value: "trial", label: "Trial" },
          { value: "at_risk", label: "At risk" },
          { value: "deprecated", label: "Deprecated" },
          { value: "archived", label: "Archived" },
        ]} />
        <Filter label="Category" value={category} onValueChange={setCategory} options={[
          { value: ALL, label: "All" },
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
        ]} />
        <Filter label="Environment" value={environment} onValueChange={setEnvironment} options={[
          { value: ALL, label: "All" },
          { value: "production", label: "Production" },
          { value: "staging", label: "Staging" },
          { value: "development", label: "Development" },
          { value: "all", label: "All envs" },
        ]} />
        <Input
          placeholder="Owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="bg-[#111318] border-[#1e2028] w-full lg:w-40"
        />
        <Button
          variant="outline"
          onClick={() => setImportOpen(true)}
          className="bg-[#111318] border-[#1e2028]"
        >
          <Upload className="w-4 h-4" /> Import
        </Button>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="w-4 h-4" /> Add resource
        </Button>
      </div>

      {table.getRowModel().rows.length === 0 ? (
        <EmptyState
          onAdd={() => setCreateOpen(true)}
          onImport={() => setImportOpen(true)}
          hasResources={resources.length > 0}
        />
      ) : (
        <div className="rounded-xl border border-[#1e2028] bg-[#111318] overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b border-[#1e2028] hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-[#1e2028] last:border-b-0 hover:bg-[#1a1d26] cursor-pointer"
                  onClick={() => setSelectedId(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 py-2.5 text-xs text-slate-500 border-t border-[#1e2028]">
            {filteredResources.length} of {resources.length} resources
          </div>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl bg-[#111318] border-[#1e2028]">
          <DialogHeader>
            <DialogTitle>Add resource</DialogTitle>
            <DialogDescription>
              Register a vendor, subscription, API, or piece of infrastructure.
            </DialogDescription>
          </DialogHeader>
          <ResourceForm
            mode="create"
            workspaceId={workspaceId}
            projects={projects}
            lockProjectId={scopedProjectId}
            onSuccess={onCreated}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ResourceDetailSheet
        resourceId={selectedId}
        workspaceId={workspaceId}
        projects={projects}
        onClose={closeDrawer}
        onMutated={onMutated}
        onDeleted={onDeleted}
      />
    </div>
  );
}

function Filter({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full lg:w-36 bg-[#111318] border-[#1e2028]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({
  onAdd,
  onImport,
  hasResources,
}: {
  onAdd: () => void;
  onImport: () => void;
  hasResources: boolean;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
        <Database className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">
        {hasResources ? "No resources match these filters" : "Your registry is empty"}
      </h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        {hasResources
          ? "Adjust the filters or clear them to see your full inventory."
          : "Register the first piece of infrastructure — or bring in a whole batch from CSV or a .env file."}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={onAdd}>
          <PlusCircle className="w-4 h-4" /> Add resource
        </Button>
        {!hasResources && (
          <Button variant="outline" onClick={onImport}>
            <Upload className="w-4 h-4" /> Import from CSV or .env
          </Button>
        )}
      </div>
    </div>
  );
}

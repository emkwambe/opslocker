"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LifecycleBadge } from "@/components/shared/badges";
import { cn, formatCurrency } from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type Row = Resource & {
  projectName: string;
  projectColor: string | null;
};

type Props = {
  resources: Row[];
  currency?: string;
};

export function VendorSpendTable({ resources, currency = "USD" }: Props) {
  const data = useMemo(
    () => resources.filter((r) => (r.monthlyCost ?? 0) > 0),
    [resources]
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: "monthlyCost", desc: true },
  ]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorFn: (r) => r.vendorName ?? r.name,
        id: "vendor",
        header: ({ column }) => (
          <SortHeader column={column}>Vendor</SortHeader>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-100">
            {row.original.vendorName ?? row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Resource",
        cell: ({ row }) => (
          <Link
            href={`/registry?resourceId=${row.original.id}`}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-400 capitalize">
            {String(getValue() ?? "").replace("_", "/")}
          </span>
        ),
      },
      {
        accessorKey: "lifecycleState",
        header: ({ column }) => (
          <SortHeader column={column}>Lifecycle</SortHeader>
        ),
        cell: ({ getValue }) => <LifecycleBadge state={String(getValue() ?? "active")} />,
      },
      {
        accessorKey: "monthlyCost",
        header: ({ column }) => (
          <SortHeader column={column} numeric>
            Monthly
          </SortHeader>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-slate-200 tabular-nums">
            {formatCurrency(row.original.monthlyCost ?? 0, row.original.currency ?? currency)}
          </span>
        ),
        sortingFn: (a, b) =>
          (a.original.monthlyCost ?? 0) - (b.original.monthlyCost ?? 0),
      },
      {
        id: "annualCost",
        header: ({ column }) => (
          <SortHeader column={column} numeric>
            Annual
          </SortHeader>
        ),
        accessorFn: (r) => (r.monthlyCost ?? 0) * 12,
        cell: ({ row }) => (
          <span className="text-sm text-slate-400 tabular-nums">
            {formatCurrency(
              (row.original.monthlyCost ?? 0) * 12,
              row.original.currency ?? currency
            )}
          </span>
        ),
      },
      {
        id: "project",
        header: "Project",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: row.original.projectColor ?? "#475569" }}
            />
            <span className="truncate">{row.original.projectName}</span>
          </div>
        ),
      },
    ],
    [currency]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
        <DollarSign className="w-5 h-5 text-slate-500 mx-auto" />
        <p className="text-sm text-slate-300 font-medium mt-3">
          No spend tracked yet
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Add monthly cost to resources in the registry to see them here.
        </p>
      </div>
    );
  }

  return (
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
          {table.getRowModel().rows.map((row) => {
            const lifecycle = row.original.lifecycleState;
            const accent =
              lifecycle === "deprecated" || lifecycle === "at_risk"
                ? "border-l-2 border-l-amber-500/60"
                : "";
            return (
              <TableRow
                key={row.id}
                className={cn(
                  "border-b border-[#1e2028] last:border-b-0 hover:bg-[#1a1d26]",
                  accent
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function SortHeader({
  column,
  numeric,
  children,
}: {
  column: { getToggleSortingHandler: () => ((e: unknown) => void) | undefined; getIsSorted: () => false | "asc" | "desc" };
  numeric?: boolean;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide hover:text-slate-300 transition-colors",
        sorted ? "text-slate-200" : "text-slate-500",
        numeric && "justify-end"
      )}
    >
      {children}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );
}

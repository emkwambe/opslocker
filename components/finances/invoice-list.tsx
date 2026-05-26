"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InvoiceDialog } from "@/components/finances/invoice-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

type InvoiceRow = {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceVendor: string | null;
  vendor: string;
  amount: number;
  currency: string | null;
  billingPeriod: string | null;
  invoiceDate: string | null;
  notes: string | null;
};

type Props = {
  invoices: InvoiceRow[];
  resources: { id: string; name: string; vendorName: string | null }[];
};

export function InvoiceList({ invoices, resources }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    setDeleteError(null);
    const res = await fetch(`/api/invoices/${deleteId}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setDeleteError(body?.error ?? "Failed to delete invoice");
      setBusy(false);
      return;
    }
    setDeleteId(null);
    setBusy(false);
    router.refresh();
  };

  return (
    <section id="invoices" className="rounded-xl border border-[#1e2028] bg-[#111318]">
      <header className="px-5 py-4 border-b border-[#1e2028] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-100">Invoices</h2>
          <span className="text-xs text-slate-500">
            {invoices.length} record{invoices.length === 1 ? "" : "s"}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          disabled={resources.length === 0}
        >
          <PlusCircle className="w-3.5 h-3.5" /> Add invoice
        </Button>
      </header>

      {invoices.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-300 font-medium">
            No invoices recorded yet
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Recording invoices builds month-over-month spend trends and powers the
            chart above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#1e2028] hover:bg-transparent">
                <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Vendor
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Resource
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Period
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Date
                </TableHead>
                <TableHead className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Notes
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="border-b border-[#1e2028] last:border-b-0 hover:bg-[#1a1d26]"
                >
                  <TableCell className="py-3 text-sm font-medium text-slate-100">
                    {inv.vendor}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-slate-300">
                    {inv.resourceName}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-slate-100 tabular-nums">
                    {formatCurrency(inv.amount, inv.currency ?? "USD")}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-400">
                    {inv.billingPeriod ?? "—"}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-400">
                    {inv.invoiceDate ? formatDate(inv.invoiceDate) : "—"}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-400 max-w-[200px] truncate">
                    {inv.notes ?? ""}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteId(inv.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InvoiceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        resources={resources}
        onCreated={() => {
          setAddOpen(false);
          router.refresh();
        }}
      />

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <AlertDialogContent className="bg-[#111318] border-[#1e2028]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              The invoice record will be removed and stop counting toward spend
              trends. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {deleteError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={busy}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

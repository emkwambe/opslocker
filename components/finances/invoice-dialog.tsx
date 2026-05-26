"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"] as const;

const schema = z.object({
  resourceId: z.string().min(1, "Required"),
  vendor: z.string().min(1, "Required").max(100),
  amount: z.coerce.number().min(0, "Must be ≥ 0"),
  currency: z.enum(CURRENCIES),
  billingPeriod: z.string().max(40).optional(),
  invoiceDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

type ResourceOption = {
  id: string;
  name: string;
  vendorName: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: ResourceOption[];
  defaultResourceId?: string;
  onCreated: () => void;
};

export function InvoiceDialog({
  open,
  onOpenChange,
  resources,
  defaultResourceId,
  onCreated,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialResourceId = defaultResourceId ?? resources[0]?.id ?? "";
  const initialVendor =
    resources.find((r) => r.id === initialResourceId)?.vendorName ?? "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      resourceId: initialResourceId,
      vendor: initialVendor,
      amount: 0,
      currency: "USD",
      billingPeriod: "",
      invoiceDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const resourceId = watch("resourceId");

  useEffect(() => {
    if (!open) return;
    const r = resources.find((x) => x.id === resourceId);
    if (r?.vendorName) {
      // Only autofill vendor when blank — don't overwrite a user edit
      const current = watch("vendor");
      if (!current) setValue("vendor", r.vendorName, { shouldDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId, open]);

  useEffect(() => {
    if (!open) {
      reset({
        resourceId: defaultResourceId ?? resources[0]?.id ?? "",
        vendor: resources.find((r) => r.id === (defaultResourceId ?? resources[0]?.id))?.vendorName ?? "",
        amount: 0,
        currency: "USD",
        billingPeriod: "",
        invoiceDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      setSubmitError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const amount = Math.round(values.amount * 100) / 100;
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        amount,
        billingPeriod: values.billingPeriod || null,
        invoiceDate: values.invoiceDate || null,
        notes: values.notes || null,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to record invoice");
      return;
    }
    onCreated();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#111318] border-[#1e2028]">
        <DialogHeader>
          <DialogTitle>Record invoice</DialogTitle>
          <DialogDescription>
            Attach a billed amount to a resource to track spend over time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Resource</Label>
            <Controller
              control={control}
              name="resourceId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    const r = resources.find((x) => x.id === v);
                    if (r?.vendorName)
                      setValue("vendor", r.vendorName, { shouldDirty: false });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                        {r.vendorName ? ` · ${r.vendorName}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.resourceId && (
              <p className="text-xs text-red-400">{errors.resourceId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-slate-300">Vendor</Label>
              <Input placeholder="OpenAI" {...register("vendor")} />
              {errors.vendor && (
                <p className="text-xs text-red-400">{errors.vendor.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Amount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-red-400">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Billing period</Label>
              <Input placeholder="2026-04 or Q1 2026" {...register("billingPeriod")} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Invoice date</Label>
              <Input type="date" {...register("invoiceDate")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Notes · optional</Label>
            <Textarea rows={2} placeholder="Plan change, overage, …" {...register("notes")} />
          </div>

          {submitError && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? "Saving" : "Record invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

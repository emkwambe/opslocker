"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RELATIONSHIP_TYPES = [
  { value: "depends_on", label: "Depends on" },
  { value: "bills_through", label: "Bills through" },
  { value: "authenticates_with", label: "Authenticates with" },
  { value: "sends_through", label: "Sends through" },
  { value: "deploys_to", label: "Deploys to" },
  { value: "integrates_with", label: "Integrates with" },
] as const;

const schema = z
  .object({
    sourceResourceId: z.string().min(1, "Required"),
    targetResourceId: z.string().min(1, "Required"),
    relationshipType: z.enum([
      "depends_on",
      "bills_through",
      "authenticates_with",
      "sends_through",
      "deploys_to",
      "integrates_with",
    ]),
    notes: z.string().max(500).optional(),
  })
  .refine((v) => v.sourceResourceId !== v.targetResourceId, {
    message: "Source and target must differ",
    path: ["targetResourceId"],
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources: { id: string; name: string; vendorName: string | null }[];
  defaultSourceId?: string;
  onCreated: () => void;
};

export function AddRelationshipDialog({
  open,
  onOpenChange,
  resources,
  defaultSourceId,
  onCreated,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sourceResourceId: defaultSourceId ?? resources[0]?.id ?? "",
      targetResourceId: resources[1]?.id ?? resources[0]?.id ?? "",
      relationshipType: "depends_on",
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const res = await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, notes: values.notes || null }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to create relationship");
      return;
    }
    onCreated();
    reset();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#111318] border-[#1e2028]">
        <DialogHeader>
          <DialogTitle>Add relationship</DialogTitle>
          <DialogDescription>
            Map an operational dependency between two resources. Useful for ownership,
            renewal cascade, and decommission analysis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs text-slate-300">Source</Label>
              <Controller
                control={control}
                name="sourceResourceId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sourceResourceId && (
                <p className="text-xs text-red-400">{errors.sourceResourceId.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Type</Label>
              <Controller
                control={control}
                name="relationshipType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Target</Label>
              <Controller
                control={control}
                name="targetResourceId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.targetResourceId && (
                <p className="text-xs text-red-400">{errors.targetResourceId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300">Notes · optional</Label>
            <Textarea
              rows={2}
              placeholder="Why this relationship exists"
              {...register("notes")}
            />
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
              {isSubmitting ? "Saving" : "Add relationship"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { Resource } from "@/lib/schema";

const CATEGORIES = [
  "database",
  "api",
  "domain",
  "cloud",
  "auth",
  "ci_cd",
  "analytics",
  "communication",
  "storage",
  "monitoring",
  "subscription",
  "other",
] as const;
const ENVIRONMENTS = ["development", "staging", "production", "all"] as const;
const LIFECYCLE = ["active", "trial", "at_risk", "deprecated", "archived"] as const;

const CATEGORY_LABEL: Record<(typeof CATEGORIES)[number], string> = {
  database: "Database",
  api: "API",
  domain: "Domain",
  cloud: "Cloud",
  auth: "Auth",
  ci_cd: "CI/CD",
  analytics: "Analytics",
  communication: "Communication",
  storage: "Storage",
  monitoring: "Monitoring",
  subscription: "Subscription",
  other: "Other",
};

const LIFECYCLE_LABEL: Record<(typeof LIFECYCLE)[number], string> = {
  active: "Active",
  trial: "Trial",
  at_risk: "At risk",
  deprecated: "Deprecated",
  archived: "Archived",
};

const formSchema = z.object({
  name: z.string().min(1, "Required").max(200),
  vendorName: z.string().max(100).optional(),
  category: z.enum(CATEGORIES),
  environment: z.enum(ENVIRONMENTS),
  lifecycleState: z.enum(LIFECYCLE),
  owner: z.string().max(100).optional(),
  renewalDate: z.string().optional(),
  monthlyCost: z.coerce.number().min(0),
  currency: z.string().min(1).max(8),
  notes: z.string().max(5000).optional(),
  tagsInput: z.string().optional(),
  website: z.string().optional(),
  projectId: z.string().min(1, "Required"),
});

export type ResourceFormValues = z.infer<typeof formSchema>;

type Props = {
  mode: "create" | "edit";
  workspaceId: string;
  projects: { id: string; name: string }[];
  resource?: Resource;
  lockProjectId?: string;
  onSuccess: (resource: Resource) => void;
  onCancel?: () => void;
};

export function ResourceForm({
  mode,
  workspaceId,
  projects,
  resource,
  lockProjectId,
  onSuccess,
  onCancel,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultProjectId =
    lockProjectId ?? resource?.projectId ?? projects[0]?.id ?? "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resource?.name ?? "",
      vendorName: resource?.vendorName ?? "",
      category: (resource?.category as (typeof CATEGORIES)[number]) ?? "other",
      environment:
        (resource?.environment as (typeof ENVIRONMENTS)[number]) ?? "production",
      lifecycleState:
        (resource?.lifecycleState as (typeof LIFECYCLE)[number]) ?? "active",
      owner: resource?.owner ?? "",
      renewalDate: resource?.renewalDate ?? "",
      monthlyCost: resource?.monthlyCost ?? 0,
      currency: resource?.currency ?? "USD",
      notes: resource?.notes ?? "",
      tagsInput: (resource?.tags ?? []).join(", "),
      website: resource?.website ?? "",
      projectId: defaultProjectId,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const tags = (values.tagsInput ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: values.name,
      vendorName: values.vendorName || null,
      category: values.category,
      environment: values.environment,
      lifecycleState: values.lifecycleState,
      owner: values.owner || null,
      renewalDate: values.renewalDate || null,
      monthlyCost: values.monthlyCost,
      currency: values.currency,
      notes: values.notes || null,
      tags,
      website: values.website || null,
      projectId: values.projectId,
      ...(mode === "create" ? { workspaceId } : {}),
    };

    const url = mode === "create" ? "/api/resources" : `/api/resources/${resource!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to save resource");
      return;
    }
    const saved = (await res.json()) as Resource;
    onSuccess(saved);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" required error={errors.name?.message}>
          <Input placeholder="OpenAI Platform" autoFocus {...register("name")} />
        </Field>
        <Field label="Vendor" error={errors.vendorName?.message}>
          <Input placeholder="OpenAI" {...register("vendorName")} />
        </Field>

        <Field label="Category" required error={errors.category?.message}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Environment" required error={errors.environment?.message}>
          <Controller
            control={control}
            name="environment"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENTS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e === "all" ? "All" : e[0].toUpperCase() + e.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Owner" error={errors.owner?.message}>
          <Input placeholder="Person or team" {...register("owner")} />
        </Field>

        <Field label="Lifecycle state" required error={errors.lifecycleState?.message}>
          <Controller
            control={control}
            name="lifecycleState"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFECYCLE.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LIFECYCLE_LABEL[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Renewal date" error={errors.renewalDate?.message}>
          <Input type="date" {...register("renewalDate")} />
        </Field>

        <Field label="Project" required error={errors.projectId?.message}>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={Boolean(lockProjectId)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Monthly cost" error={errors.monthlyCost?.message}>
          <Input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register("monthlyCost")}
          />
        </Field>

        <Field label="Currency" error={errors.currency?.message}>
          <Input placeholder="USD" {...register("currency")} />
        </Field>

        <Field label="Website" error={errors.website?.message} className="sm:col-span-2">
          <Input placeholder="https://vendor.com" {...register("website")} />
        </Field>

        <Field
          label="Tags"
          hint="Comma-separated"
          error={errors.tagsInput?.message}
          className="sm:col-span-2"
        >
          <Input placeholder="llm, core, cleanup-needed" {...register("tagsInput")} />
        </Field>

        <Field label="Notes" error={errors.notes?.message} className="sm:col-span-2">
          <Textarea
            rows={4}
            placeholder="Why does this exist? What depends on it?"
            {...register("notes")}
          />
        </Field>
      </div>

      {submitError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "create" ? "Adding" : "Saving"}
            </>
          ) : mode === "create" ? (
            "Create resource"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="flex items-center gap-1.5 text-xs text-slate-300">
        {label}
        {!required && hint && <span className="text-slate-500 font-normal">· {hint}</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

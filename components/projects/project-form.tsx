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
import type { Project } from "@/lib/schema";
import { cn } from "@/lib/utils";

const ENVIRONMENTS = ["development", "staging", "production", "all"] as const;
const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

const formSchema = z.object({
  name: z.string().min(1, "Required").max(100),
  description: z.string().max(500).optional(),
  environment: z.enum(ENVIRONMENTS),
  color: z.string(),
  tagsInput: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  mode: "create" | "edit";
  workspaceId: string;
  project?: Project;
  onSuccess: (project: Project) => void;
  onCancel?: () => void;
};

export function ProjectForm({ mode, workspaceId, project, onSuccess, onCancel }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      environment: (project?.environment as (typeof ENVIRONMENTS)[number]) ?? "all",
      color: project?.color ?? COLORS[0],
      tagsInput: (project?.tags ?? []).join(", "),
    },
  });

  const color = watch("color");

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const tags = (values.tagsInput ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: values.name,
      description: values.description || undefined,
      environment: values.environment,
      color: values.color,
      tags,
      ...(mode === "create" ? { workspaceId } : {}),
    };

    const url = mode === "create" ? "/api/projects" : `/api/projects/${project!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to save project");
      return;
    }
    const saved = (await res.json()) as Project;
    onSuccess(saved);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-300">Name</Label>
        <Input placeholder="TaxPilot AI" autoFocus {...register("name")} />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-slate-300">Description · optional</Label>
        <Textarea
          rows={2}
          placeholder="A short description of what this project is."
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">Environment</Label>
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
                      {e === "all" ? "All envs" : e[0].toUpperCase() + e.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">Color</Label>
          <div className="flex items-center gap-1.5 h-9">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setValue("color", c, { shouldDirty: true })}
                className={cn(
                  "w-6 h-6 rounded-md transition-transform border",
                  color === c
                    ? "ring-2 ring-offset-2 ring-offset-[#111318] ring-slate-200 scale-110 border-transparent"
                    : "border-[#1e2028] hover:scale-105"
                )}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-slate-300">
          Tags <span className="text-slate-500 font-normal">· comma-separated</span>
        </Label>
        <Input placeholder="customer-facing, ai" {...register("tagsInput")} />
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
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isSubmitting ? "Saving" : mode === "create" ? "Create project" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

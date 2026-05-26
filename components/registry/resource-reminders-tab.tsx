"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Bell, PlusCircle } from "lucide-react";
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
import { SeverityBadge } from "@/components/shared/badges";
import { formatDate } from "@/lib/utils";
import type { Reminder } from "@/lib/schema";

const REMINDER_TYPES = [
  "renewal",
  "trial_expiration",
  "ownership_review",
  "lifecycle_review",
  "custom",
] as const;
const REMINDER_TYPE_LABEL: Record<(typeof REMINDER_TYPES)[number], string> = {
  renewal: "Renewal",
  trial_expiration: "Trial expiration",
  ownership_review: "Ownership review",
  lifecycle_review: "Lifecycle review",
  custom: "Custom",
};
const SEVERITY = ["critical", "high", "medium", "low"] as const;

const formSchema = z.object({
  reminderType: z.enum(REMINDER_TYPES),
  triggerDate: z.string().min(1, "Required"),
  severity: z.enum(SEVERITY),
  message: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ResourceRemindersTab({
  resourceId,
  refetchKey = 0,
}: {
  resourceId: string;
  refetchKey?: number;
}) {
  const [reminders, setReminders] = useState<Reminder[] | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setReminders(null);
    fetch(`/api/reminders?resourceId=${resourceId}`)
      .then((r) => r.json())
      .then((data) => setReminders(Array.isArray(data) ? data : []));
  }, [resourceId]);

  useEffect(() => {
    load();
  }, [load, refetchKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Active reminders
        </p>
        <Button variant="ghost" size="sm" onClick={() => setShowForm((v) => !v)}>
          <PlusCircle className="w-3.5 h-3.5" />
          {showForm ? "Cancel" : "Add reminder"}
        </Button>
      </div>

      {showForm && (
        <ReminderForm
          resourceId={resourceId}
          onSuccess={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {reminders === null ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#1e2028] bg-[#0d0f14] p-6 text-center">
          <Bell className="w-5 h-5 text-slate-500 mx-auto" />
          <p className="text-sm text-slate-300 font-medium mt-3">No reminders set</p>
          <p className="text-xs text-slate-500 mt-1">
            Add a reminder to stay ahead of renewals or trial expirations.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {reminders.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-[#1e2028] bg-[#0d0f14] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-100">
                  {REMINDER_TYPE_LABEL[r.reminderType as (typeof REMINDER_TYPES)[number]] ?? r.reminderType}
                </p>
                <SeverityBadge severity={r.severity} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Triggers {formatDate(r.triggerDate)}
                {r.isAcknowledged && " · acknowledged"}
              </p>
              {r.message && (
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{r.message}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReminderForm({
  resourceId,
  onSuccess,
}: {
  resourceId: string;
  onSuccess: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reminderType: "renewal",
      triggerDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
      severity: "medium",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceId,
        reminderType: values.reminderType,
        triggerDate: values.triggerDate,
        severity: values.severity,
        message: values.message || null,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to create reminder");
      return;
    }
    onSuccess();
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-[#1e2028] bg-[#0d0f14] p-4 space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">Type</Label>
          <Controller
            control={control}
            name="reminderType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {REMINDER_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">Trigger date</Label>
          <Input type="date" {...register("triggerDate")} />
          {errors.triggerDate && (
            <p className="text-xs text-red-400">{errors.triggerDate.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">Severity</Label>
          <Controller
            control={control}
            name="severity"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-300">Message · optional</Label>
        <Textarea rows={2} placeholder="Cancel before next billing cycle" {...register("message")} />
      </div>

      {submitError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {isSubmitting ? "Saving" : "Add reminder"}
        </Button>
      </div>
    </form>
  );
}

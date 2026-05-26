"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Check,
  Loader2,
  PlusCircle,
  Eye,
  EyeOff,
  ArrowUpRight,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { SeverityBadge } from "@/components/shared/badges";
import { cn, formatDate, getDaysUntil } from "@/lib/utils";
import type { Reminder } from "@/lib/schema";

type ReminderWithResource = Reminder & {
  resourceName: string;
  resourceVendor: string | null;
  projectId: string;
};

type Props = {
  workspaceId: string;
  initialReminders: ReminderWithResource[];
  resources: { id: string; name: string; vendorName: string | null }[];
};

const SEVERITY_ORDER: Array<"critical" | "high" | "medium" | "low"> = [
  "critical",
  "high",
  "medium",
  "low",
];

const SEVERITY_LABEL: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const REMINDER_TYPE_LABEL: Record<string, string> = {
  renewal: "Renewal",
  trial_expiration: "Trial expiration",
  ownership_review: "Ownership review",
  lifecycle_review: "Lifecycle review",
  custom: "Custom",
};

export function RemindersView({ workspaceId, initialReminders, resources }: Props) {
  const router = useRouter();
  const [reminders, setReminders] = useState(initialReminders);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      showAcknowledged
        ? reminders
        : reminders.filter((r) => !r.isAcknowledged),
    [reminders, showAcknowledged]
  );

  const grouped = useMemo(() => {
    const map: Record<string, ReminderWithResource[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };
    for (const r of visible) {
      if (map[r.severity]) map[r.severity].push(r);
    }
    return map;
  }, [visible]);

  const acknowledge = async (id: string) => {
    setErrorId(null);
    setBusyId(id);

    const snapshot = reminders;
    const nowISO = new Date().toISOString();
    setReminders((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, isAcknowledged: true, acknowledgedAt: nowISO } : r
      )
    );

    const res = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAcknowledged: true, acknowledgedAt: nowISO }),
    });

    if (!res.ok) {
      setReminders(snapshot);
      setErrorId(id);
    } else {
      router.refresh();
    }
    setBusyId(null);
  };

  const onCreated = (created: ReminderWithResource) => {
    setReminders((rs) => [...rs, created].sort((a, b) => a.triggerDate.localeCompare(b.triggerDate)));
    setCreateOpen(false);
    router.refresh();
  };

  const totalActive = reminders.filter((r) => !r.isAcknowledged).length;
  const totalAck = reminders.length - totalActive;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-slate-400">
          <span className="text-slate-100 font-medium">{totalActive}</span> active ·{" "}
          <span className="text-slate-100 font-medium">{totalAck}</span> acknowledged
        </p>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAcknowledged((v) => !v)}
          className="bg-[#111318] border-[#1e2028]"
        >
          {showAcknowledged ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> Hide acknowledged
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> Show acknowledged
            </>
          )}
        </Button>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="w-4 h-4" /> Add reminder
        </Button>
      </div>

      {reminders.length === 0 ? (
        <GlobalEmptyState onCreate={() => setCreateOpen(true)} />
      ) : visible.length === 0 ? (
        <AllAckedState onShow={() => setShowAcknowledged(true)} />
      ) : (
        <div className="space-y-7">
          {SEVERITY_ORDER.map((severity) => {
            const items = grouped[severity];
            if (items.length === 0) return null;
            return (
              <section key={severity} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={severity} />
                  <h2 className="text-sm font-semibold text-slate-200">
                    {SEVERITY_LABEL[severity]}
                  </h2>
                  <span className="text-xs text-slate-500">
                    {items.length} reminder{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((r) => (
                    <ReminderCard
                      key={r.id}
                      reminder={r}
                      busy={busyId === r.id}
                      hadError={errorId === r.id}
                      onAcknowledge={() => acknowledge(r.id)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg bg-[#111318] border-[#1e2028]">
          <DialogHeader>
            <DialogTitle>Add reminder</DialogTitle>
            <DialogDescription>
              Surface renewals, ownership checks, or lifecycle reviews before they slip.
            </DialogDescription>
          </DialogHeader>
          <CreateReminderForm
            resources={resources}
            workspaceId={workspaceId}
            onSuccess={onCreated}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReminderCard({
  reminder,
  busy,
  hadError,
  onAcknowledge,
}: {
  reminder: ReminderWithResource;
  busy: boolean;
  hadError: boolean;
  onAcknowledge: () => void;
}) {
  const days = getDaysUntil(reminder.triggerDate);
  return (
    <li
      className={cn(
        "rounded-xl border border-[#1e2028] bg-[#111318] p-4 flex flex-col gap-3",
        reminder.isAcknowledged && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {REMINDER_TYPE_LABEL[reminder.reminderType] ?? reminder.reminderType}
          </p>
          <Link
            href={`/registry?resourceId=${reminder.resourceId}`}
            className="text-sm font-semibold text-slate-100 hover:text-white mt-1 inline-flex items-center gap-1.5 transition-colors"
          >
            {reminder.resourceName}
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </Link>
          {reminder.resourceVendor && (
            <p className="text-xs text-slate-500 mt-0.5">{reminder.resourceVendor}</p>
          )}
        </div>
      </div>

      {reminder.message && (
        <p className="text-sm text-slate-300 leading-relaxed">{reminder.message}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <div className="text-xs text-slate-400">
          <span>Triggers {formatDate(reminder.triggerDate)}</span>
          <span className="text-slate-500">
            {" "}·{" "}
            {days < 0
              ? `${Math.abs(days)}d overdue`
              : days === 0
              ? "today"
              : `${days}d away`}
          </span>
          {reminder.isAcknowledged && reminder.acknowledgedAt && (
            <span className="block text-slate-500 mt-0.5">
              Acknowledged {formatDate(reminder.acknowledgedAt)}
            </span>
          )}
          {hadError && (
            <span className="block text-red-400 mt-0.5">
              Couldn&apos;t acknowledge — try again.
            </span>
          )}
        </div>

        {reminder.isAcknowledged ? (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Acknowledged
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onAcknowledge}
            disabled={busy}
            className="bg-[#0d0f14] border-[#1e2028]"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Acknowledge
          </Button>
        )}
      </div>
    </li>
  );
}

const formSchema = z.object({
  resourceId: z.string().min(1, "Required"),
  reminderType: z.enum([
    "renewal",
    "trial_expiration",
    "ownership_review",
    "lifecycle_review",
    "custom",
  ]),
  triggerDate: z.string().min(1, "Required"),
  severity: z.enum(["critical", "high", "medium", "low"]),
  message: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function CreateReminderForm({
  resources,
  workspaceId,
  onSuccess,
  onCancel,
}: {
  resources: { id: string; name: string; vendorName: string | null }[];
  workspaceId: string;
  onSuccess: (r: ReminderWithResource) => void;
  onCancel: () => void;
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
      resourceId: resources[0]?.id ?? "",
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
      body: JSON.stringify({ ...values, message: values.message || null }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to create reminder");
      return;
    }
    const saved = (await res.json()) as Reminder;
    const resource = resources.find((r) => r.id === saved.resourceId);
    onSuccess({
      ...saved,
      resourceName: resource?.name ?? "Resource",
      resourceVendor: resource?.vendorName ?? null,
      projectId: workspaceId,
    });
  });

  if (resources.length === 0) {
    return (
      <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
        Add a resource first so you have something to remind yourself about.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-300">Resource</Label>
        <Controller
          control={control}
          name="resourceId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a resource" />
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
                  {Object.entries(REMINDER_TYPE_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
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
                  {SEVERITY_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEVERITY_LABEL[s]}
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
        <Textarea
          rows={3}
          placeholder="Cancel before next billing cycle"
          {...register("message")}
        />
      </div>

      {submitError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isSubmitting ? "Saving" : "Add reminder"}
        </Button>
      </div>
    </form>
  );
}

function GlobalEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
        <Bell className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">No reminders yet</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        Set reminders for renewals, trial expirations, or lifecycle reviews so nothing
        slips through.
      </p>
      <div className="mt-6">
        <Button onClick={onCreate}>
          <PlusCircle className="w-4 h-4" /> Add your first reminder
        </Button>
      </div>
    </div>
  );
}

function AllAckedState({ onShow }: { onShow: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto">
        <Check className="w-5 h-5 text-emerald-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">
        All reminders acknowledged
      </h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        Operationally calm. Toggle &ldquo;Show acknowledged&rdquo; to review history.
      </p>
      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={onShow}>
          <Eye className="w-3.5 h-3.5" /> Show acknowledged
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2, ExternalLink, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { LifecycleBadge, EnvironmentBadge } from "@/components/shared/badges";
import { ResourceForm } from "@/components/registry/resource-form";
import { ResourceEventsTab } from "@/components/registry/resource-events-tab";
import { ResourceRemindersTab } from "@/components/registry/resource-reminders-tab";
import { OperationalHealthBar } from "@/components/registry/operational-health-bar";
import { OperationalNotes } from "@/components/registry/operational-notes";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type Props = {
  resourceId: string | null;
  workspaceId: string;
  projects: { id: string; name: string }[];
  onClose: () => void;
  onMutated: (updated: Resource) => void;
  onDeleted: () => void;
};

export function ResourceDetailSheet({
  resourceId,
  workspaceId,
  projects,
  onClose,
  onMutated,
  onDeleted,
}: Props) {
  const open = Boolean(resourceId);
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (!resourceId) {
      setResource(null);
      setEditing(false);
      setConfirmDelete(false);
      setDeleteError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/resources/${resourceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.error) {
          setResource(null);
        } else {
          setResource(data as Resource);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  const handleDelete = async () => {
    if (!resource) return;
    setDeleteError(null);
    const res = await fetch(`/api/resources/${resource.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setDeleteError(body?.error ?? "Failed to delete resource");
      return;
    }
    setConfirmDelete(false);
    onDeleted();
  };

  const markReviewed = async () => {
    if (!resource || reviewing) return;
    setReviewing(true);
    const now = new Date().toISOString();
    const res = await fetch(`/api/resources/${resource.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastReviewedAt: now }),
    });
    setReviewing(false);
    if (!res.ok) return;
    const updated = (await res.json()) as Resource;
    setResource(updated);
    setRefetchKey((k) => k + 1);
    onMutated(updated);
  };

  const projectName = resource
    ? projects.find((p) => p.id === resource.projectId)?.name ?? "—"
    : "";

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-[#0d0f14] border-l border-[#1e2028] p-0 flex flex-col"
      >
        {loading || !resource ? (
          <div className="flex-1 flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            ) : (
              <p className="text-sm text-slate-500">Resource not found</p>
            )}
          </div>
        ) : (
          <>
            <SheetHeader className="px-6 pt-6 pb-4 space-y-3 border-b border-[#1e2028]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {projectName}
                  </p>
                  <SheetTitle className="text-xl font-semibold text-slate-100 mt-1 truncate">
                    {resource.name}
                  </SheetTitle>
                  <SheetDescription className="text-sm text-slate-400 mt-1">
                    {resource.vendorName ? `${resource.vendorName} · ` : ""}
                    <span className="capitalize">
                      {resource.category.replace("_", "/")}
                    </span>
                  </SheetDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0 mr-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markReviewed}
                    disabled={reviewing || editing}
                    title="Confirm operational status is current"
                  >
                    {reviewing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Mark reviewed
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing((e) => !e)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {editing ? "Cancel edit" : "Edit"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <LifecycleBadge state={resource.lifecycleState} />
                <EnvironmentBadge environment={resource.environment ?? "production"} />
                {(resource.tags ?? []).slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-slate-400 bg-[#1a1d26] border border-[#1e2028] rounded-md px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </SheetHeader>

            <OperationalHealthBar resource={resource} workspaceId={workspaceId} />

            <div className="flex-1 overflow-y-auto">
              {editing ? (
                <div className="p-6">
                  <ResourceForm
                    mode="edit"
                    workspaceId={workspaceId}
                    projects={projects}
                    resource={resource}
                    onSuccess={(updated) => {
                      setResource(updated);
                      setEditing(false);
                      setRefetchKey((k) => k + 1);
                      onMutated(updated);
                    }}
                    onCancel={() => setEditing(false)}
                  />
                </div>
              ) : (
                <Tabs defaultValue="overview" className="px-6 pt-4 pb-6">
                  <TabsList className="bg-[#111318] border border-[#1e2028]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="reminders">Reminders</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-5 space-y-5">
                    <Overview
                      resource={resource}
                      onResourceUpdated={(updated) => {
                        setResource(updated);
                        onMutated(updated);
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="events" className="mt-5">
                    <ResourceEventsTab
                      resourceId={resource.id}
                      refetchKey={refetchKey}
                    />
                  </TabsContent>
                  <TabsContent value="reminders" className="mt-5">
                    <ResourceRemindersTab
                      resourceId={resource.id}
                      refetchKey={refetchKey}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </>
        )}

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent className="bg-[#111318] border-[#1e2028]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
              <AlertDialogDescription>
                {resource?.name} will be permanently removed from the registry. A timeline
                entry will record the deletion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {deleteError}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

function Overview({
  resource,
  onResourceUpdated,
}: {
  resource: Resource;
  onResourceUpdated: (updated: Resource) => void;
}) {
  const cost = resource.monthlyCost ?? 0;
  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Owner" value={resource.owner ?? "—"} />
        <Field
          label="Renewal date"
          value={resource.renewalDate ? formatDate(resource.renewalDate) : "—"}
        />
        <Field
          label="Monthly cost"
          value={cost > 0 ? `${formatCurrency(cost, resource.currency ?? "USD")}/mo` : "—"}
        />
        <Field
          label="Last reviewed"
          value={
            resource.lastReviewedAt ? (
              <span className="text-slate-200">
                {formatDate(resource.lastReviewedAt)}
              </span>
            ) : (
              <span className="text-amber-300">Never reviewed</span>
            )
          }
        />
        <Field
          label="Website"
          value={
            resource.website ? (
              <a
                href={resource.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                {resource.website.replace(/^https?:\/\//, "")}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              "—"
            )
          }
        />
        <Field
          label="Documentation"
          value={
            resource.documentationUrl ? (
              <a
                href={resource.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Open
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              "—"
            )
          }
        />
      </div>

      <Separator className="bg-[#1e2028]" />

      <OperationalNotes
        resourceId={resource.id}
        notes={resource.notes}
        updatedAt={resource.updatedAt}
        onSaved={(nextNotes, updatedAt) =>
          onResourceUpdated({ ...resource, notes: nextNotes, updatedAt })
        }
      />

      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tags</p>
        {resource.tags && resource.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {resource.tags.map((t) => (
              <span
                key={t}
                className="text-xs text-slate-300 bg-[#1a1d26] border border-[#1e2028] rounded-md px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 mt-2 italic">None</p>
        )}
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="text-sm text-slate-200 mt-1">{value}</div>
    </div>
  );
}

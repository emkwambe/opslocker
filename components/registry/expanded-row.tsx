"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Pencil,
  ExternalLink,
  Loader2,
  UserCheck,
  UserX,
  Clock,
  GitBranch,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type Props = {
  resource: Resource;
  relationshipCount: { incoming: number; outgoing: number } | null;
  onOpenDrawer: () => void;
  onResourceUpdated: (updated: Resource) => void;
};

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function ExpandedRow({
  resource,
  relationshipCount,
  onOpenDrawer,
  onResourceUpdated,
}: Props) {
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const markReviewed = async () => {
    if (reviewing) return;
    setReviewing(true);
    setReviewError(null);
    const now = new Date().toISOString();
    const res = await fetch(`/api/resources/${resource.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastReviewedAt: now }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setReviewError(body?.error ?? "Failed to mark reviewed");
      setReviewing(false);
      return;
    }
    const updated = (await res.json()) as Resource;
    onResourceUpdated(updated);
    setReviewing(false);
  };

  const owner = resource.owner?.trim() || null;
  const lastReviewed = resource.lastReviewedAt;
  const reviewDays = lastReviewed ? daysSince(lastReviewed) : null;
  const incoming = relationshipCount?.incoming ?? 0;
  const outgoing = relationshipCount?.outgoing ?? 0;

  return (
    <div className="px-5 py-5 bg-[#0d0f14] border-y border-[#1e2028]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: operational summary */}
        <div className="space-y-4 min-w-0">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <FileText className="w-3 h-3" />
              Operational summary
            </p>
            {resource.notes ? (
              <p className="text-sm text-slate-300 leading-relaxed mt-2 whitespace-pre-wrap line-clamp-4">
                {resource.notes}
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic mt-2">
                No operational context recorded for this resource yet.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Stat
              icon={owner ? UserCheck : UserX}
              tone={owner ? "good" : "warn"}
              label="Owner"
              value={
                owner ? (
                  <span className="text-slate-100">{owner}</span>
                ) : (
                  <span className="text-amber-300">Unassigned</span>
                )
              }
            />
            <Stat
              icon={Clock}
              tone={lastReviewed ? (reviewDays! > 90 ? "warn" : "good") : "warn"}
              label="Last reviewed"
              value={
                lastReviewed ? (
                  <span className="text-slate-200">
                    {formatDate(lastReviewed)}{" "}
                    <span className="text-slate-500">
                      · {reviewDays === 0 ? "today" : `${reviewDays}d ago`}
                    </span>
                  </span>
                ) : (
                  <span className="text-amber-300">Never reviewed</span>
                )
              }
            />
            <Stat
              icon={GitBranch}
              tone={incoming + outgoing > 0 ? "good" : "warn"}
              label="Relationships"
              value={
                relationshipCount === null ? (
                  <span className="text-slate-500">Loading…</span>
                ) : incoming + outgoing === 0 ? (
                  <span className="text-amber-300">Orphan</span>
                ) : (
                  <span className="text-slate-200">
                    Depends on {outgoing} · Depended on by {incoming}
                  </span>
                )
              }
            />
          </div>
        </div>

        {/* Right: quick actions */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Quick actions
          </p>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={markReviewed}
              disabled={reviewing}
              className="bg-[#111318] border-[#1e2028] justify-start"
            >
              {reviewing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Mark as reviewed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenDrawer}
              className="bg-[#111318] border-[#1e2028] justify-start"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              size="sm"
              onClick={onOpenDrawer}
              className="justify-start"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open full details
            </Button>
          </div>
          {reviewError && (
            <p className="text-xs text-red-400">{reviewError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-lg border border-[#1e2028] bg-[#111318] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "w-3.5 h-3.5",
            tone === "good" ? "text-emerald-400" : "text-amber-400"
          )}
        />
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <div className="text-sm mt-1">{value}</div>
    </div>
  );
}

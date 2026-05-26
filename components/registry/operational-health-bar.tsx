"use client";

import { useEffect, useState } from "react";
import { UserCheck, UserX, Clock, GitBranch, CalendarCheck, CalendarX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resource } from "@/lib/schema";

type Tone = "good" | "warn" | "bad";

type Pill = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: Tone;
};

const TONE_STYLES: Record<Tone, string> = {
  good: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200",
  warn: "border-amber-500/30 bg-amber-500/[0.06] text-amber-200",
  bad: "border-red-500/30 bg-red-500/[0.06] text-red-200",
};

const ICON_TONE: Record<Tone, string> = {
  good: "text-emerald-400",
  warn: "text-amber-400",
  bad: "text-red-400",
};

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function OperationalHealthBar({
  resource,
  workspaceId,
}: {
  resource: Resource;
  workspaceId: string;
}) {
  const [relCount, setRelCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRelCount(null);
    fetch(`/api/relationships?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then(
        (data: Array<{ sourceResourceId: string; targetResourceId: string }>) => {
          if (cancelled || !Array.isArray(data)) return;
          const count = data.filter(
            (rel) =>
              rel.sourceResourceId === resource.id ||
              rel.targetResourceId === resource.id
          ).length;
          setRelCount(count);
        }
      )
      .catch(() => {
        if (!cancelled) setRelCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [resource.id, workspaceId]);

  const pills: Pill[] = [];

  // Owner
  if (resource.owner && resource.owner.trim() !== "") {
    pills.push({
      icon: UserCheck,
      label: "Owner",
      value: resource.owner,
      tone: "good",
    });
  } else {
    pills.push({
      icon: UserX,
      label: "Owner",
      value: "Unassigned",
      tone: "warn",
    });
  }

  // Last reviewed
  if (!resource.lastReviewedAt) {
    pills.push({
      icon: Clock,
      label: "Reviewed",
      value: "Never",
      tone: "warn",
    });
  } else {
    const days = daysSince(resource.lastReviewedAt);
    pills.push({
      icon: Clock,
      label: "Reviewed",
      value: days === 0 ? "Today" : `${days}d ago`,
      tone: days > 90 ? "warn" : "good",
    });
  }

  // Relationships
  if (relCount === null) {
    pills.push({
      icon: GitBranch,
      label: "Relationships",
      value: "…",
      tone: "good",
    });
  } else if (relCount === 0) {
    pills.push({
      icon: GitBranch,
      label: "Relationships",
      value: "Orphan",
      tone: "warn",
    });
  } else {
    pills.push({
      icon: GitBranch,
      label: "Relationships",
      value: `${relCount} link${relCount === 1 ? "" : "s"}`,
      tone: "good",
    });
  }

  // Renewal
  if (!resource.renewalDate) {
    pills.push({
      icon: CalendarCheck,
      label: "Renewal",
      value: "No date",
      tone: "good",
    });
  } else {
    const days = daysUntil(resource.renewalDate);
    if (days < 0) {
      pills.push({
        icon: CalendarX,
        label: "Renewal",
        value: `${Math.abs(days)}d overdue`,
        tone: "bad",
      });
    } else if (days <= 7) {
      pills.push({
        icon: CalendarX,
        label: "Renewal",
        value: `${days}d`,
        tone: "warn",
      });
    } else if (days <= 30) {
      pills.push({
        icon: CalendarCheck,
        label: "Renewal",
        value: `${days}d`,
        tone: "warn",
      });
    } else {
      pills.push({
        icon: CalendarCheck,
        label: "Renewal",
        value: `${days}d`,
        tone: "good",
      });
    }
  }

  return (
    <div className="px-6 py-3 border-b border-[#1e2028] bg-[#0a0b0e]/40">
      <div className="flex items-center gap-2 flex-wrap">
        {pills.map((pill, i) => {
          const Icon = pill.icon;
          return (
            <div
              key={i}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
                TONE_STYLES[pill.tone]
              )}
              title={`${pill.label}: ${pill.value}`}
            >
              <Icon className={cn("w-3 h-3", ICON_TONE[pill.tone])} />
              <span className="text-slate-500 text-[10px] uppercase tracking-wide">
                {pill.label}
              </span>
              <span className="font-medium truncate max-w-[120px]">{pill.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

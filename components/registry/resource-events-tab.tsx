"use client";

import { useEffect, useState } from "react";
import { Loader2, CircleDot } from "lucide-react";
import type { OperationalEvent } from "@/lib/schema";

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

export function ResourceEventsTab({
  resourceId,
  refetchKey = 0,
}: {
  resourceId: string;
  refetchKey?: number;
}) {
  const [events, setEvents] = useState<OperationalEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEvents(null);
    fetch(`/api/events?resourceId=${resourceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setEvents(Array.isArray(data) ? data : []);
      });
    return () => {
      cancelled = true;
    };
  }, [resourceId, refetchKey]);

  if (events === null) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#1e2028] bg-[#0d0f14] p-6 text-center">
        <p className="text-sm text-slate-300 font-medium">No events yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Changes to this resource will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-3">
      {events.map((e) => (
        <li
          key={e.id}
          className="rounded-lg border border-[#1e2028] bg-[#0d0f14] px-4 py-3 flex items-start gap-3"
        >
          <CircleDot className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-200">{e.description ?? e.eventType}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {e.actor ?? "system"} · {relativeTime(e.timestamp)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

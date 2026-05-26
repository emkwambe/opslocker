"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CirclePlus,
  PenSquare,
  Archive,
  KeyRound,
  UserCog,
  AlertTriangle,
  CircleDot,
  Loader2,
  X,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

type TimelineEvent = {
  id: string;
  workspaceId: string;
  projectId: string | null;
  resourceId: string | null;
  eventType: string;
  actor: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
  resourceName: string | null;
  projectName: string | null;
  projectColor: string | null;
};

type Props = {
  workspaceId: string;
  initialEvents: TimelineEvent[];
  initialHasMore: boolean;
  initialNextOffset: number | null;
};

const EVENT_META: Record<string, { icon: LucideIcon; tone: string; label: string }> = {
  resource_created: { icon: CirclePlus, tone: "text-emerald-400 bg-emerald-400/10", label: "Resource added" },
  resource_updated: { icon: PenSquare, tone: "text-blue-400 bg-blue-400/10", label: "Resource updated" },
  resource_archived: { icon: Archive, tone: "text-zinc-400 bg-zinc-400/10", label: "Resource archived" },
  secret_rotated: { icon: KeyRound, tone: "text-purple-400 bg-purple-400/10", label: "Secret rotated" },
  ownership_changed: { icon: UserCog, tone: "text-amber-400 bg-amber-400/10", label: "Ownership changed" },
  renewal_flagged: { icon: AlertTriangle, tone: "text-amber-400 bg-amber-400/10", label: "Renewal flagged" },
  subscription_upgraded: { icon: PenSquare, tone: "text-blue-400 bg-blue-400/10", label: "Subscription upgraded" },
  trial_expired: { icon: AlertTriangle, tone: "text-red-400 bg-red-400/10", label: "Trial expired" },
  service_deprecated: { icon: Archive, tone: "text-orange-400 bg-orange-400/10", label: "Service deprecated" },
  lifecycle_changed: { icon: PenSquare, tone: "text-blue-400 bg-blue-400/10", label: "Lifecycle changed" },
};

const EVENT_TYPE_OPTIONS = Object.entries(EVENT_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

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

function dateBucket(timestamp: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const day = new Date(timestamp);
  day.setHours(0, 0, 0, 0);
  if (day.getTime() === today.getTime()) return "Today";
  if (day.getTime() === yesterday.getTime()) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: day.getFullYear() === today.getFullYear() ? undefined : "numeric",
  }).format(day);
}

export function TimelineView({
  workspaceId,
  initialEvents,
  initialHasMore,
  initialNextOffset,
}: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextOffset, setNextOffset] = useState<number | null>(initialNextOffset);
  const [loadingMore, setLoadingMore] = useState(false);
  const [resourceQuery, setResourceQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    setEvents(initialEvents);
    setHasMore(initialHasMore);
    setNextOffset(initialNextOffset);
  }, [initialEvents, initialHasMore, initialNextOffset]);

  const reload = async (typesParam?: Set<string>) => {
    setReloading(true);
    const types = typesParam ?? selectedTypes;
    const params = new URLSearchParams({ workspaceId, limit: "50", offset: "0" });
    if (types.size > 0) params.set("eventType", Array.from(types).join(","));
    const res = await fetch(`/api/timeline?${params.toString()}`);
    const data = (await res.json()) as {
      events: TimelineEvent[];
      hasMore: boolean;
      nextOffset: number | null;
    };
    setEvents(data.events);
    setHasMore(data.hasMore);
    setNextOffset(data.nextOffset);
    setReloading(false);
  };

  const loadMore = async () => {
    if (nextOffset === null) return;
    setLoadingMore(true);
    const params = new URLSearchParams({
      workspaceId,
      limit: "50",
      offset: String(nextOffset),
    });
    if (selectedTypes.size > 0)
      params.set("eventType", Array.from(selectedTypes).join(","));
    const res = await fetch(`/api/timeline?${params.toString()}`);
    const data = (await res.json()) as {
      events: TimelineEvent[];
      hasMore: boolean;
      nextOffset: number | null;
    };
    setEvents((prev) => [...prev, ...data.events]);
    setHasMore(data.hasMore);
    setNextOffset(data.nextOffset);
    setLoadingMore(false);
  };

  const toggleType = (value: string) => {
    const next = new Set(selectedTypes);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelectedTypes(next);
    reload(next);
  };

  const filteredEvents = useMemo(() => {
    const q = resourceQuery.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        (e.resourceName ?? "").toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q)
    );
  }, [events, resourceQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const e of filteredEvents) {
      const bucket = dateBucket(e.timestamp);
      if (!map.has(bucket)) map.set(bucket, []);
      map.get(bucket)!.push(e);
    }
    return Array.from(map.entries());
  }, [filteredEvents]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Input
          placeholder="Filter by resource or description…"
          value={resourceQuery}
          onChange={(e) => setResourceQuery(e.target.value)}
          className="bg-[#111318] border-[#1e2028] lg:max-w-md"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-[#111318] border-[#1e2028]">
              <Filter className="w-3.5 h-3.5" />
              Event type
              {selectedTypes.size > 0 && (
                <span className="ml-1 text-xs bg-blue-600/20 text-blue-300 px-1.5 py-0.5 rounded">
                  {selectedTypes.size}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by event type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={selectedTypes.has(opt.value)}
                onCheckedChange={() => toggleType(opt.value)}
                onSelect={(e) => e.preventDefault()}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedTypes.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTypes(new Set());
              reload(new Set());
            }}
          >
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}

        <div className="flex-1" />
        {reloading && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {grouped.map(([bucket, items]) => (
            <section key={bucket} className="space-y-2">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {bucket}
              </h2>
              <ul className="rounded-xl border border-[#1e2028] bg-[#111318] divide-y divide-[#1e2028]">
                {items.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </ul>
            </section>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-[#111318] border-[#1e2028]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}

          {!hasMore && events.length > 0 && (
            <div className="flex justify-center pt-2">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Check className="w-3 h-3" /> End of timeline
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: TimelineEvent }) {
  const meta = EVENT_META[event.eventType] ?? {
    icon: CircleDot,
    tone: "text-slate-400 bg-slate-400/10",
    label: event.eventType.replace(/_/g, " "),
  };
  const Icon = meta.icon;

  const resourceLink = event.resourceId ? (
    <Link
      href={`/registry?resourceId=${event.resourceId}`}
      className="text-slate-200 hover:text-white transition-colors"
    >
      {event.resourceName ?? "Resource"}
    </Link>
  ) : (
    <span className="text-slate-400 italic">deleted resource</span>
  );

  return (
    <li className="px-5 py-3.5 flex items-start gap-3">
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${meta.tone}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-200">
          {event.description ?? meta.label}
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
          <span>{event.actor ?? "system"}</span>
          <span>·</span>
          <span>{relativeTime(event.timestamp)}</span>
          {event.projectName && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                {event.projectColor && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: event.projectColor }}
                  />
                )}
                {event.projectName}
              </span>
            </>
          )}
          {event.resourceId && (
            <>
              <span>·</span>
              {resourceLink}
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
        <Activity className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">No events to show</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        Operational events will appear here as you add, update, and archive resources.
      </p>
    </div>
  );
}

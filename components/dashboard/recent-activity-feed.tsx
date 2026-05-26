import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CirclePlus,
  PenSquare,
  Archive,
  KeyRound,
  UserCog,
  AlertTriangle,
  CircleDot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityRow } from "@/lib/db/queries";

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
};

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

export function RecentActivityFeed({ events }: { events: ActivityRow[] }) {
  return (
    <section className="rounded-xl border border-[#1e2028] bg-[#111318]">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[#1e2028]">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-100">Recent activity</h2>
        </div>
        <Link
          href="/timeline"
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          View timeline <ArrowUpRight className="w-3 h-3" />
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-300 font-medium">No activity yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Add resources and changes will appear here as an operational timeline.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#1e2028]">
          {events.map((e) => {
            const meta = EVENT_META[e.eventType] ?? {
              icon: CircleDot,
              tone: "text-slate-400 bg-slate-400/10",
              label: e.eventType.replace(/_/g, " "),
            };
            const Icon = meta.icon;
            return (
              <li key={e.id} className="flex items-start gap-3 px-5 py-3.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${meta.tone}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200">
                    {e.description ?? meta.label}
                    {e.resourceName && (
                      <span className="text-slate-500"> · {e.resourceName}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {e.actor ?? "system"} · {relativeTime(e.timestamp)}
                    {e.projectName && ` · ${e.projectName}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

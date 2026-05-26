"use client";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useUIStore } from "@/store";

const PAGE_LABELS: Array<[RegExp, string]> = [
  [/^\/dashboard/, "Dashboard"],
  [/^\/projects\/[^/]+/, "Project"],
  [/^\/projects/, "Projects"],
  [/^\/registry/, "Registry"],
  [/^\/graph/, "Graph"],
  [/^\/timeline/, "Timeline"],
  [/^\/subscriptions/, "Subscriptions"],
  [/^\/finances/, "Finances"],
  [/^\/reminders/, "Reminders"],
  [/^\/search/, "Search"],
  [/^\/settings/, "Settings"],
];

function pageLabel(pathname: string): string {
  for (const [pattern, label] of PAGE_LABELS) {
    if (pattern.test(pathname)) return label;
  }
  return "";
}

export function AppHeader() {
  const pathname = usePathname();
  const { setCommandPaletteOpen } = useUIStore();
  const label = pageLabel(pathname);

  return (
    <header className="h-14 border-b border-[#1e2028] flex items-center justify-between px-6 shrink-0 bg-[#0a0b0e]">
      <div className="flex items-center gap-2 min-w-0">
        {label && (
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
            {label}
          </p>
        )}
      </div>
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e2028] bg-[#111318] text-slate-400 hover:text-slate-200 hover:border-[#2a2d38] transition-colors text-sm"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:block text-xs">Search resources, jump anywhere…</span>
        <div className="hidden sm:flex items-center gap-0.5 ml-2">
          <kbd className="px-1.5 py-0.5 text-xs bg-[#1a1d26] rounded border border-[#2a2d38] text-slate-500">
            ⌘K
          </kbd>
        </div>
      </button>
    </header>
  );
}

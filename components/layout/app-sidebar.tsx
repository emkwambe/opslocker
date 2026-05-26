"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  GitBranch,
  Clock,
  Bell,
  DollarSign,
  Repeat,
  Search,
  Settings,
  Lock,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: null },
  { label: "Projects", href: "/projects", icon: FolderOpen, shortcut: null },
  { label: "Registry", href: "/registry", icon: Database, shortcut: "R" },
  { label: "Graph", href: "/graph", icon: GitBranch, shortcut: "G" },
  { label: "Timeline", href: "/timeline", icon: Clock, shortcut: "T" },
  { label: "Subscriptions", href: "/subscriptions", icon: Repeat, shortcut: null },
  { label: "Finances", href: "/finances", icon: DollarSign, shortcut: null },
  { label: "Reminders", href: "/reminders", icon: Bell, shortcut: null },
  { label: "Search", href: "/search", icon: Search, shortcut: "⌘K" },
  { label: "Settings", href: "/settings", icon: Settings, shortcut: null },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "flex flex-col h-full bg-[#0d0f14] border-r border-[#1e2028] transition-all duration-200 shrink-0",
          sidebarCollapsed ? "w-14" : "w-56"
        )}
      >
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-[#1e2028]">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-slate-100 text-sm tracking-tight">
              OpsLocker
            </span>
          )}
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon, shortcut }) => {
            const active = pathname.startsWith(href);
            const link = (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors group",
                  active
                    ? "bg-blue-600/15 text-blue-400 border border-blue-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#1a1d26]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{label}</span>
                    {shortcut && (
                      <kbd className="text-[10px] font-medium text-slate-600 group-hover:text-slate-400 bg-[#1a1d26] border border-[#1e2028] rounded px-1.5 py-0.5 transition-colors">
                        {shortcut}
                      </kbd>
                    )}
                  </>
                )}
              </Link>
            );

            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  className="bg-[#111318] border-[#1e2028] text-slate-200"
                >
                  <span className="text-xs">{label}</span>
                  {shortcut && (
                    <span className="text-xs text-slate-500 ml-2">{shortcut}</span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="py-3 px-2 border-t border-[#1e2028]">
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2.5 px-2.5 py-2 w-full rounded-md text-sm text-slate-500 hover:text-slate-300 hover:bg-[#1a1d26] transition-colors"
          >
            <ChevronLeft
              className={cn("w-4 h-4 transition-transform", sidebarCollapsed && "rotate-180")}
            />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

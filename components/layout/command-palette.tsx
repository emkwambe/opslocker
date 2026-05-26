"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Database,
  GitBranch,
  Clock,
  DollarSign,
  Bell,
  Search as SearchIcon,
  Settings,
  PlusCircle,
  Upload,
  ArrowRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/store";

type Resource = { id: string; name: string; vendorName: string | null };

type Props = { resources: Resource[] };

const NAV_COMMANDS = [
  { label: "Go to Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Go to Projects", path: "/projects", icon: FolderOpen },
  { label: "Go to Registry", path: "/registry", icon: Database },
  { label: "Go to Graph", path: "/graph", icon: GitBranch },
  { label: "Go to Timeline", path: "/timeline", icon: Clock },
  { label: "Go to Subscriptions", path: "/subscriptions", icon: DollarSign },
  { label: "Go to Reminders", path: "/reminders", icon: Bell },
  { label: "Go to Search", path: "/search", icon: SearchIcon },
  { label: "Go to Settings", path: "/settings", icon: Settings },
];

export function CommandPalette({ resources }: Props) {
  const router = useRouter();
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setImportOpen = useUIStore((s) => s.setImportOpen);
  const setNewResourceOpen = useUIStore((s) => s.setNewResourceOpen);
  const setNewProjectOpen = useUIStore((s) => s.setNewProjectOpen);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const filteredResources = useMemo(() => {
    if (!search.trim()) return resources.slice(0, 8);
    const q = search.toLowerCase();
    return resources
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.vendorName ?? "").toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [resources, search]);

  const close = () => setOpen(false);

  const runAction = (action: () => void) => {
    close();
    // Defer so dialog close animation doesn't conflict
    setTimeout(action, 50);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search resources…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem
            value="new-resource add resource"
            onSelect={() => runAction(() => setNewResourceOpen(true))}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New resource</span>
          </CommandItem>
          <CommandItem
            value="new-project create project"
            onSelect={() => runAction(() => setNewProjectOpen(true))}
          >
            <FolderOpen className="w-4 h-4" />
            <span>New project</span>
          </CommandItem>
          <CommandItem
            value="import csv env"
            onSelect={() => runAction(() => setImportOpen(true))}
          >
            <Upload className="w-4 h-4" />
            <span>Import from CSV or .env</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {NAV_COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.path}
                value={cmd.label}
                onSelect={() => runAction(() => router.push(cmd.path))}
              >
                <Icon className="w-4 h-4" />
                <span>{cmd.label}</span>
                <ArrowRight className="ml-auto w-3 h-3 text-slate-600" />
              </CommandItem>
            );
          })}
        </CommandGroup>

        {filteredResources.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Resources">
              {filteredResources.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`resource ${r.name} ${r.vendorName ?? ""}`}
                  onSelect={() =>
                    runAction(() => router.push(`/registry?resourceId=${r.id}`))
                  }
                >
                  <Database className="w-4 h-4" />
                  <div className="flex items-center justify-between gap-2 min-w-0 flex-1">
                    <span className="truncate">{r.name}</span>
                    {r.vendorName && (
                      <span className="text-xs text-slate-500 truncate shrink-0">
                        {r.vendorName}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FileJson,
  FileText,
  Download,
  Loader2,
  Database,
  FolderOpen,
  GitBranch,
  Clock,
  Bell,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Counts = {
  workspaces: number;
  projects: number;
  resources: number;
  relationships: number;
  events: number;
  invoices: number;
  reminders: number;
};

type PreviewResponse = {
  workspace: { id: string; name: string };
  counts: Counts;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
};

const COUNT_ROWS: Array<{
  key: keyof Counts;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "workspaces", label: "Workspaces", icon: Building2 },
  { key: "projects", label: "Projects", icon: FolderOpen },
  { key: "resources", label: "Resources", icon: Database },
  { key: "relationships", label: "Relationships", icon: GitBranch },
  { key: "events", label: "Operational events", icon: Clock },
  { key: "invoices", label: "Invoices", icon: FileSpreadsheet },
  { key: "reminders", label: "Reminders", icon: Bell },
];

export function ExportPreviewDialog({ open, onOpenChange, workspaceId }: Props) {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setData(null);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/export/preview?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.error) setLoadError(d.error);
        else setData(d as PreviewResponse);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Failed to load preview");
      });
    return () => {
      cancelled = true;
    };
  }, [open, workspaceId]);

  const startDownload = (format: "json" | "csv") => {
    const href = `/api/export?format=${format}&workspaceId=${workspaceId}`;
    // Use a hidden anchor so the browser handles Content-Disposition naturally
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success(`Export started · ${format.toUpperCase()}`, {
      description: data?.workspace.name
        ? `${data.workspace.name} · check your downloads folder`
        : "Check your downloads folder",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#111318] border-[#1e2028]">
        <DialogHeader>
          <DialogTitle>Export preview</DialogTitle>
          <DialogDescription>
            You own this data. Here&apos;s exactly what will be included before you download.
          </DialogDescription>
        </DialogHeader>

        {loadError ? (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {loadError}
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-[#1e2028] bg-[#0d0f14] divide-y divide-[#1e2028]">
              {COUNT_ROWS.map(({ key, label, icon: Icon }) => {
                const value = data.counts[key];
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{label}</span>
                    </div>
                    <span className="text-sm tabular-nums font-medium text-slate-100">
                      {value.toLocaleString("en-US")}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500">
              Filename will be{" "}
              <code className="text-slate-300 bg-[#1a1d26] border border-[#1e2028] rounded px-1.5 py-0.5">
                opslocker-{slugify(data.workspace.name)}-{new Date()
                  .toISOString()
                  .slice(0, 10)}
                .json
              </code>
              .
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => startDownload("csv")}
                className="bg-[#0d0f14] border-[#1e2028]"
              >
                <FileText className="w-3.5 h-3.5" />
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
              <Button onClick={() => startDownload("json")}>
                <FileJson className="w-3.5 h-3.5" />
                <Download className="w-3.5 h-3.5" /> JSON
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "workspace"
  );
}

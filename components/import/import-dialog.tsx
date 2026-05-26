"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  KeyRound,
  Download,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Project = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projects: Project[];
};

const CSV_HEADERS = [
  "name",
  "vendorName",
  "category",
  "environment",
  "owner",
  "lifecycleState",
  "renewalDate",
  "monthlyCost",
  "currency",
  "notes",
  "tags",
  "website",
];

const SAMPLE_ROW: Record<string, string> = {
  name: "OpenAI Platform",
  vendorName: "OpenAI",
  category: "api",
  environment: "production",
  owner: "Eddy Mkwambe",
  lifecycleState: "active",
  renewalDate: "2026-09-01",
  monthlyCost: "380",
  currency: "USD",
  notes: "GPT-4o for our copilot",
  tags: "llm,core",
  website: "https://platform.openai.com",
};

function downloadCsvTemplate() {
  const csv = Papa.unparse({ fields: CSV_HEADERS, data: [SAMPLE_ROW] });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "opslocker-template.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ImportDialog({ open, onOpenChange, workspaceId, projects }: Props) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>(projects[0]?.id ?? "");

  useEffect(() => {
    if (!projectId && projects[0]) setProjectId(projects[0].id);
  }, [projects, projectId]);

  const close = () => {
    onOpenChange(false);
  };

  const noProjects = projects.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#111318] border-[#1e2028]">
        <DialogHeader>
          <DialogTitle>Import resources</DialogTitle>
          <DialogDescription>
            Skip the blank-registry problem — pull in vendors from CSV or an .env file.
          </DialogDescription>
        </DialogHeader>

        {noProjects ? (
          <NoProjectsBanner />
        ) : (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Import into project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="csv" className="mt-2">
              <TabsList className="bg-[#0d0f14] border border-[#1e2028]">
                <TabsTrigger value="csv">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </TabsTrigger>
                <TabsTrigger value="env">
                  <KeyRound className="w-3.5 h-3.5" /> .env file
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="mt-4">
                <CsvImportTab
                  workspaceId={workspaceId}
                  projectId={projectId}
                  onImported={() => router.refresh()}
                  onClose={close}
                />
              </TabsContent>

              <TabsContent value="env" className="mt-4">
                <EnvImportTab
                  workspaceId={workspaceId}
                  projectId={projectId}
                  onImported={() => router.refresh()}
                  onClose={close}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function NoProjectsBanner() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      Create a project first — imports need a project to land in.
    </div>
  );
}

type CsvResult = {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
};

function CsvImportTab({
  workspaceId,
  projectId,
  onImported,
  onClose,
}: {
  workspaceId: string;
  projectId: string;
  onImported: () => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{
    headers: string[];
    rows: Record<string, string>[];
    total: number;
  } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CsvResult | null>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    setPreview(null);
    setParseError(null);
    setResult(null);
    setSubmitError(null);
    if (!f) return;

    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      preview: 6,
      complete: (parsed) => {
        if (parsed.errors.length > 0 && parsed.data.length === 0) {
          setParseError(parsed.errors[0].message);
          return;
        }
        const headers = (parsed.meta.fields ?? []).map((h) => h.trim());
        setPreview({
          headers,
          rows: parsed.data.slice(0, 5),
          total: 0,
        });

        // Also count total rows in a second non-preview parse
        Papa.parse<Record<string, string>>(f, {
          header: true,
          skipEmptyLines: true,
          complete: (full) => {
            setPreview({
              headers,
              rows: parsed.data.slice(0, 5),
              total: full.data.length,
            });
          },
        });
      },
    });
  };

  const detected = preview?.headers ?? [];
  const matched = useMemo(
    () =>
      CSV_HEADERS.filter((h) =>
        detected.some((d) => d.toLowerCase() === h.toLowerCase())
      ),
    [detected]
  );
  const unrecognized = useMemo(
    () =>
      detected.filter(
        (h) => !CSV_HEADERS.some((c) => c.toLowerCase() === h.toLowerCase())
      ),
    [detected]
  );

  const upload = async () => {
    if (!file) return;
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);

    const form = new FormData();
    form.append("file", file);
    form.append("projectId", projectId);
    form.append("workspaceId", workspaceId);

    const res = await fetch("/api/import/csv", { method: "POST", body: form });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to import CSV");
      setSubmitting(false);
      return;
    }
    const data = (await res.json()) as CsvResult;
    setResult(data);
    setSubmitting(false);
    if (data.imported > 0) onImported();
  };

  if (result) {
    return (
      <ResultPanel
        imported={result.imported}
        skipped={result.skipped}
        errors={result.errors}
        onClose={onClose}
        onReset={() => {
          setFile(null);
          setPreview(null);
          setResult(null);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-[#1e2028] bg-[#0d0f14] px-4 py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-blue-600/10 border border-blue-600/30 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">
              {file ? file.name : "Choose a CSV file"}
            </p>
            <p className="text-xs text-slate-500">
              {file
                ? `${(file.size / 1024).toFixed(1)} kB`
                : "Expected columns: name, vendorName, category, owner, …"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadCsvTemplate}
            className="bg-[#111318] border-[#1e2028]"
          >
            <Download className="w-3.5 h-3.5" /> Template
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="bg-[#111318] border-[#1e2028]"
          >
            {file ? "Replace" : "Choose file"}
          </Button>
        </div>
      </div>

      {parseError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {parseError}
        </div>
      )}

      {preview && (
        <div className="rounded-lg border border-[#1e2028] bg-[#0d0f14] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1e2028] flex items-center justify-between">
            <p className="text-xs text-slate-300">
              <span className="font-medium text-slate-100">{preview.total || preview.rows.length}</span>{" "}
              row{preview.total === 1 ? "" : "s"} detected · showing first{" "}
              {Math.min(preview.rows.length, 5)}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400">
                {matched.length}/{CSV_HEADERS.length} matched
              </span>
              {unrecognized.length > 0 && (
                <span className="text-amber-400">
                  · {unrecognized.length} unrecognized
                </span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#111318]">
                <tr>
                  {preview.headers.map((h) => {
                    const known = CSV_HEADERS.some(
                      (c) => c.toLowerCase() === h.toLowerCase()
                    );
                    return (
                      <th
                        key={h}
                        className={
                          known
                            ? "px-3 py-2 text-left font-medium text-slate-300 whitespace-nowrap"
                            : "px-3 py-2 text-left font-medium text-amber-400 whitespace-nowrap"
                        }
                      >
                        {h}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-t border-[#1e2028]">
                    {preview.headers.map((h) => (
                      <td
                        key={h}
                        className="px-3 py-2 text-slate-400 whitespace-nowrap max-w-[200px] truncate"
                      >
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={upload} disabled={!file || submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitting ? "Importing" : "Import resources"}
        </Button>
      </div>
    </div>
  );
}

function EnvImportTab({
  workspaceId,
  projectId,
  onImported,
  onClose,
}: {
  workspaceId: string;
  projectId: string;
  onImported: () => void;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(
    null
  );

  const { keys, skippedCount } = useMemo(() => parseEnvClient(content), [content]);

  const upload = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);
    const res = await fetch("/api/import/env", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, projectId, workspaceId }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError(body?.error ?? "Failed to import .env");
      setSubmitting(false);
      return;
    }
    const data = (await res.json()) as { imported: number; skipped: number };
    setResult(data);
    setSubmitting(false);
    if (data.imported > 0) onImported();
  };

  if (result) {
    return (
      <ResultPanel
        imported={result.imported}
        skipped={result.skipped}
        onClose={onClose}
        onReset={() => {
          setContent("");
          setResult(null);
        }}
        title="Created from .env keys"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-slate-300">Paste your .env file content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          spellCheck={false}
          placeholder={"# Production secrets\nOPENAI_API_KEY=sk-...\nSTRIPE_SECRET_KEY=sk_live_...\nDATABASE_URL=postgres://..."}
          className="font-mono text-xs"
        />
      </div>

      {keys.length > 0 && (
        <div className="rounded-lg border border-[#1e2028] bg-[#0d0f14] p-4">
          <p className="text-xs text-slate-300">
            <span className="font-medium text-slate-100">{keys.length}</span> key
            {keys.length === 1 ? "" : "s"} detected
            {skippedCount > 0 && (
              <span className="text-slate-500"> · {skippedCount} skipped</span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {keys.map((k) => (
              <code
                key={k}
                className="text-xs bg-[#1a1d26] border border-[#1e2028] rounded px-1.5 py-0.5 text-slate-300"
              >
                {k}
              </code>
            ))}
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={upload} disabled={keys.length === 0 || submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitting
            ? "Importing"
            : keys.length > 0
            ? `Import ${keys.length} key${keys.length === 1 ? "" : "s"}`
            : "Import"}
        </Button>
      </div>
    </div>
  );
}

function ResultPanel({
  imported,
  skipped,
  errors,
  onClose,
  onReset,
  title = "Import complete",
}: {
  imported: number;
  skipped: number;
  errors?: Array<{ row: number; message: string }>;
  onClose: () => void;
  onReset: () => void;
  title?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-200">{title}</p>
          <p className="text-xs text-emerald-300/80 mt-0.5">
            {imported} resource{imported === 1 ? "" : "s"} imported
            {skipped > 0 && ` · ${skipped} skipped`}
          </p>
        </div>
      </div>

      {errors && errors.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-sm text-amber-200 font-medium">
            <AlertCircle className="w-4 h-4" />
            Skipped rows
          </div>
          <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i} className="text-xs text-amber-200/80">
                <span className="font-mono">row {e.row}</span> · {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onReset}>
          Import more
        </Button>
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  );
}

function parseEnvClient(content: string): { keys: string[]; skippedCount: number } {
  if (!content.trim()) return { keys: [], skippedCount: 0 };
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const keys: string[] = [];
  let skipped = 0;
  const seen = new Set<string>();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      skipped++;
      continue;
    }
    const eqIdx = line.indexOf("=");
    if (eqIdx <= 0) {
      skipped++;
      continue;
    }
    const key = line.slice(0, eqIdx).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      skipped++;
      continue;
    }
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);
    keys.push(key);
  }
  return { keys, skippedCount: skipped };
}

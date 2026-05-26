"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X, Loader2, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type Props = {
  resourceId: string;
  notes: string | null;
  updatedAt: string;
  onSaved: (next: string | null, updatedAt: string) => void;
};

const PLACEHOLDER =
  "No operational context recorded. Add notes about why this service exists, who made the decision, and what depends on it.";

export function OperationalNotes({ resourceId, notes, updatedAt, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(notes ?? "");
      setError(null);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [editing, notes]);

  const save = async () => {
    const next = draft.trim();
    const current = (notes ?? "").trim();
    if (next === current) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/resources/${resourceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: next === "" ? null : next }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Failed to save notes");
      setBusy(false);
      return;
    }
    const updated = (await res.json()) as { notes: string | null; updatedAt: string };
    onSaved(updated.notes, updated.updatedAt);
    setEditing(false);
    setBusy(false);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const charCount = (notes ?? "").length;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
          <FileText className="w-3 h-3" />
          Operational notes
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-slate-500 hover:text-slate-200 transition-colors inline-flex items-center gap-1 text-xs"
          >
            <Pencil className="w-3 h-3" />
            {notes ? "Edit" : "Add notes"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            disabled={busy}
            placeholder={PLACEHOLDER}
            className="text-sm leading-relaxed"
          />
          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">
              {draft.length.toLocaleString()} / 5,000 characters
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={cancel}
                disabled={busy}
              >
                <X className="w-3 h-3" /> Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={busy}>
                {busy ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Save notes
              </Button>
            </div>
          </div>
        </div>
      ) : notes ? (
        <div className="space-y-2">
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {notes}
          </div>
          <p className="text-xs text-slate-500">
            {charCount.toLocaleString()} characters · last edited {formatDate(updatedAt)}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#1e2028] bg-[#0d0f14] px-4 py-5 text-center">
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            {PLACEHOLDER}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 bg-[#111318] border-[#1e2028]"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-3 h-3" /> Add notes
          </Button>
        </div>
      )}
    </div>
  );
}

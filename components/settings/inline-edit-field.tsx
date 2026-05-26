"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | null;
  multiline?: boolean;
  placeholder?: string;
  onSave: (next: string | null) => Promise<{ ok: boolean; error?: string }>;
};

export function InlineEditField({
  label,
  value,
  multiline,
  placeholder,
  onSave,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value ?? "");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, value]);

  const commit = async () => {
    if (busy) return;
    const next = draft.trim();
    if (next === (value ?? "").trim()) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setError(null);
    const result = await onSave(next === "" ? null : next);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Failed to save");
      return;
    }
    setEditing(false);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
    setDraft(value ?? "");
  };

  if (!editing) {
    return (
      <div className="group">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <div className="flex items-start gap-2 mt-1">
          <p
            className={cn(
              "text-sm break-words flex-1",
              value ? "text-slate-200" : "text-slate-500 italic"
            )}
          >
            {value ?? placeholder ?? "—"}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-200 shrink-0"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <div className="mt-1 space-y-1.5">
        {multiline ? (
          <Textarea
            ref={(el) => {
              inputRef.current = el;
            }}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
          />
        ) : (
          <Input
            ref={(el) => {
              inputRef.current = el;
            }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={commit}
          />
        )}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={commit}
            disabled={busy}
            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Save
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          <span className="text-slate-600 ml-auto">
            {multiline ? "Esc to cancel" : "Enter to save · Esc to cancel"}
          </span>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

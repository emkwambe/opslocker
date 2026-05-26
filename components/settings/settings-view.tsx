"use client";

import Link from "next/link";
import { Download, Upload, FileText, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";

type Props = {
  workspace: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
  };
  stats: {
    projects: number;
    resources: number;
    reminders: number;
  };
};

export function SettingsView({ workspace, stats }: Props) {
  const setImportOpen = useUIStore((s) => s.setImportOpen);

  return (
    <div className="space-y-6">
      <Section title="Workspace" subtitle="Identity and creation metadata.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" value={workspace.name} />
          <Field
            label="Created"
            value={new Date(workspace.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          />
          <Field
            label="Description"
            value={workspace.description ?? "—"}
            className="sm:col-span-2"
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#1e2028]">
          <Stat label="Projects" value={stats.projects} />
          <Stat label="Resources" value={stats.resources} />
          <Stat label="Reminders" value={stats.reminders} />
        </div>
      </Section>

      <Section title="Data" subtitle="Import, export, and own your operational memory.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Action
            icon={Upload}
            iconTone="text-blue-400 bg-blue-400/10 border-blue-400/20"
            title="Import resources"
            description="Bring vendors in from a CSV file or paste an .env block."
            cta={
              <Button onClick={() => setImportOpen(true)} variant="outline" size="sm">
                <Upload className="w-3.5 h-3.5" /> Open importer
              </Button>
            }
          />
          <Action
            icon={FileJson}
            iconTone="text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
            title="Export JSON"
            description="Full workspace snapshot including events, invoices, and relationships."
            cta={
              <Button asChild variant="outline" size="sm">
                <a href="/api/export?format=json" download>
                  <Download className="w-3.5 h-3.5" /> Download .json
                </a>
              </Button>
            }
          />
          <Action
            icon={FileText}
            iconTone="text-amber-400 bg-amber-400/10 border-amber-400/20"
            title="Export resources CSV"
            description="Resources only, ready for spreadsheets, finance reviews, or reimports."
            cta={
              <Button asChild variant="outline" size="sm">
                <a href="/api/export?format=csv" download>
                  <Download className="w-3.5 h-3.5" /> Download .csv
                </a>
              </Button>
            }
          />
        </div>
      </Section>

      <Section title="About" subtitle="OpsLocker is local-first by design.">
        <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
          <p>
            Your data lives in a SQLite file on this machine. You own the database, can
            inspect it, and can move it without vendor lock-in.
          </p>
          <p className="text-slate-500">
            Version 0.1.0 · Built for indie builders, agencies, and platform teams that
            need infrastructure memory.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/registry"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Open registry →
          </Link>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#1e2028] bg-[#111318]">
      <header className="px-5 py-4 border-b border-[#1e2028]">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-slate-200 mt-1 break-words">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-semibold text-slate-100 mt-1 tabular-nums">{value}</p>
    </div>
  );
}

function Action({
  icon: Icon,
  iconTone,
  title,
  description,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconTone: string;
  title: string;
  description: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#1e2028] bg-[#0d0f14] p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${iconTone}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-100">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex justify-end">{cta}</div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { workspaces } from "@/lib/schema";
import { WorkspaceInitForm } from "@/components/setup/workspace-init-form";
import { Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const rows = await getDb().select({ id: workspaces.id }).from(workspaces).limit(1);
  if (rows.length > 0) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">OpsLocker</span>
        </div>

        <div className="rounded-xl border border-[#1e2028] bg-[#111318] p-8">
          <h1 className="text-xl font-semibold text-slate-100">Create your first workspace</h1>
          <p className="text-sm text-slate-400 mt-2">
            A workspace holds your projects, vendors, subscriptions, and operational memory. You can
            export, rename, or delete it anytime.
          </p>

          <div className="mt-6">
            <WorkspaceInitForm />
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6 text-center">
          Your data lives locally in a SQLite file. Nothing is uploaded.
        </p>
      </div>
    </div>
  );
}

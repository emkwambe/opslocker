import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { projects, resources } from "@/lib/schema";
import { getDefaultWorkspace } from "@/lib/db/queries";
import { SearchView } from "@/components/search/search-view";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const workspace = await getDefaultWorkspace();
  if (!workspace) redirect("/setup");

  const db = getDb();
  const [resourceRows, projectRows] = await Promise.all([
    db
      .select()
      .from(resources)
      .where(eq(resources.workspaceId, workspace.id))
      .orderBy(desc(resources.updatedAt)),
    db
      .select({ id: projects.id, name: projects.name })
      .from(projects)
      .where(eq(projects.workspaceId, workspace.id)),
  ]);

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {workspace.name}
        </p>
        <h1 className="text-2xl font-semibold text-slate-100 mt-1">Search</h1>
        <p className="text-sm text-slate-400 mt-1.5">
          Find resources across vendors, owners, projects, and operational notes.
        </p>
      </div>

      <SearchView resources={resourceRows} projects={projectRows} />
    </div>
  );
}

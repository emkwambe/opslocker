"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, FolderOpen, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnvironmentBadge } from "@/components/shared/badges";
import { ProjectForm } from "@/components/projects/project-form";
import type { Project } from "@/lib/schema";

type ProjectWithCount = Project & { resourceCount: number };

type Props = {
  workspaceId: string;
  projects: ProjectWithCount[];
};

const ALL = "__all__";

export function ProjectsView({ workspaceId, projects }: Props) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [envFilter, setEnvFilter] = useState<string>(ALL);
  const [tagQuery, setTagQuery] = useState("");

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (envFilter !== ALL && p.environment !== envFilter) return false;
        if (tagQuery.trim()) {
          const q = tagQuery.toLowerCase();
          if (!(p.tags ?? []).some((t) => t.toLowerCase().includes(q))) return false;
        }
        return true;
      }),
    [projects, envFilter, tagQuery]
  );

  const onCreated = () => {
    setCreateOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <Select value={envFilter} onValueChange={setEnvFilter}>
          <SelectTrigger className="w-full lg:w-44 bg-[#111318] border-[#1e2028]">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All environments</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="all">All envs</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by tag"
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
          className="bg-[#111318] border-[#1e2028] lg:w-56"
        />
        <div className="flex-1" />
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="w-4 h-4" /> Create project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : filtered.length === 0 ? (
        <NoMatches onClear={() => { setEnvFilter(ALL); setTagQuery(""); }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg bg-[#111318] border-[#1e2028]">
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              A project groups related infrastructure under one application or environment.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            mode="create"
            workspaceId={workspaceId}
            onSuccess={onCreated}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectWithCount }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group rounded-xl border border-[#1e2028] bg-[#111318] p-5 transition-all hover:border-[#2a2d38] hover:bg-[#13161d]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className="w-2.5 h-2.5 rounded-full mt-2 shrink-0"
            style={{ backgroundColor: project.color ?? "#3b82f6" }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-white">
              {project.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[2rem]">
              {project.description ?? "No description"}
            </p>
          </div>
        </div>
        <EnvironmentBadge environment={project.environment ?? "all"} />
      </div>

      <div className="flex items-center justify-between mt-5">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Database className="w-3.5 h-3.5" />
          {project.resourceCount} resource{project.resourceCount === 1 ? "" : "s"}
        </span>
        {project.tags && project.tags.length > 0 && (
          <div className="flex items-center gap-1 max-w-[60%] overflow-hidden">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-slate-400 bg-[#1a1d26] border border-[#1e2028] rounded px-1.5 py-0.5 truncate"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
        <FolderOpen className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">No projects yet</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        Group related vendors, APIs, and infrastructure under a project to keep
        operational context together.
      </p>
      <div className="mt-6">
        <Button onClick={onCreate}>
          <PlusCircle className="w-4 h-4" /> Create your first project
        </Button>
      </div>
    </div>
  );
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <p className="text-sm text-slate-300 font-medium">No projects match these filters</p>
      <p className="text-xs text-slate-500 mt-1">Adjust the environment or tag filters.</p>
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

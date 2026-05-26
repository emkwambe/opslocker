"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportDialog } from "@/components/import/import-dialog";
import { ResourceForm } from "@/components/registry/resource-form";
import { ProjectForm } from "@/components/projects/project-form";
import { useUIStore } from "@/store";

type Props = {
  workspaceId: string;
  projects: { id: string; name: string }[];
};

export function GlobalDialogs({ workspaceId, projects }: Props) {
  const router = useRouter();
  const importOpen = useUIStore((s) => s.importOpen);
  const setImportOpen = useUIStore((s) => s.setImportOpen);
  const newResourceOpen = useUIStore((s) => s.newResourceOpen);
  const setNewResourceOpen = useUIStore((s) => s.setNewResourceOpen);
  const newProjectOpen = useUIStore((s) => s.newProjectOpen);
  const setNewProjectOpen = useUIStore((s) => s.setNewProjectOpen);

  return (
    <>
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        workspaceId={workspaceId}
        projects={projects}
      />

      <Dialog open={newResourceOpen} onOpenChange={setNewResourceOpen}>
        <DialogContent className="max-w-2xl bg-[#111318] border-[#1e2028]">
          <DialogHeader>
            <DialogTitle>Create resource</DialogTitle>
            <DialogDescription>
              Register a vendor, subscription, API, or piece of infrastructure.
            </DialogDescription>
          </DialogHeader>
          {projects.length === 0 ? (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Create a project first — resources live inside projects.
            </div>
          ) : (
            <ResourceForm
              mode="create"
              workspaceId={workspaceId}
              projects={projects}
              onSuccess={() => {
                setNewResourceOpen(false);
                router.refresh();
              }}
              onCancel={() => setNewResourceOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent className="max-w-lg bg-[#111318] border-[#1e2028]">
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              A project groups related infrastructure under one application or
              environment.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            mode="create"
            workspaceId={workspaceId}
            onSuccess={() => {
              setNewProjectOpen(false);
              router.refresh();
            }}
            onCancel={() => setNewProjectOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

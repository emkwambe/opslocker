"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceStore {
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  setActiveWorkspace: (id: string) => void;
  setActiveProject: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeProjectId: null,
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      setActiveProject: (id) => set({ activeProjectId: id }),
    }),
    {
      name: "opslocker-workspace",
      partialize: (s) => ({
        activeWorkspaceId: s.activeWorkspaceId,
        activeProjectId: s.activeProjectId,
      }),
    }
  )
);

interface UIStore {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  importOpen: boolean;
  newResourceOpen: boolean;
  newProjectOpen: boolean;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setImportOpen: (open: boolean) => void;
  setNewResourceOpen: (open: boolean) => void;
  setNewProjectOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  importOpen: false,
  newResourceOpen: false,
  newProjectOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setImportOpen: (open) => set({ importOpen: open }),
  setNewResourceOpen: (open) => set({ newResourceOpen: open }),
  setNewProjectOpen: (open) => set({ newProjectOpen: open }),
}));

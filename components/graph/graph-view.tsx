"use client";

import "reactflow/dist/style.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import {
  PlusCircle,
  EyeOff,
  Eye,
  GitBranch,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ResourceNode,
  type ResourceNodeData,
} from "@/components/graph/resource-node";
import { AddRelationshipDialog } from "@/components/graph/add-relationship-dialog";
import { ResourceDetailSheet } from "@/components/registry/resource-detail-sheet";
import { layoutGraph } from "@/lib/graph/layout";
import type { Resource } from "@/lib/schema";

export type GraphRelationship = {
  id: string;
  sourceResourceId: string;
  targetResourceId: string;
  relationshipType: string;
  notes: string | null;
};

const NODE_TYPES = { resource: ResourceNode };

const LIFECYCLE_STATES = [
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "at_risk", label: "At risk" },
  { value: "deprecated", label: "Deprecated" },
  { value: "archived", label: "Archived" },
];

const EDGE_STYLE: Record<string, { stroke: string; label: string }> = {
  depends_on: { stroke: "#60a5fa", label: "depends on" },
  bills_through: { stroke: "#fbbf24", label: "bills through" },
  authenticates_with: { stroke: "#a78bfa", label: "auth via" },
  deploys_to: { stroke: "#34d399", label: "deploys to" },
  sends_through: { stroke: "#22d3ee", label: "sends through" },
  integrates_with: { stroke: "#94a3b8", label: "integrates with" },
};

type Props = {
  workspaceId: string;
  resources: Resource[];
  relationships: GraphRelationship[];
  projects: { id: string; name: string }[];
};

function GraphCanvas({ workspaceId, resources, relationships, projects }: Props) {
  const router = useRouter();
  const [hiddenStates, setHiddenStates] = useState<Set<string>>(new Set());
  const [highlightOrphans, setHighlightOrphans] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const connectedIds = useMemo(() => {
    const set = new Set<string>();
    for (const r of relationships) {
      set.add(r.sourceResourceId);
      set.add(r.targetResourceId);
    }
    return set;
  }, [relationships]);

  const visibleResources = useMemo(
    () => resources.filter((r) => !hiddenStates.has(r.lifecycleState)),
    [resources, hiddenStates]
  );

  const visibleResourceIds = useMemo(
    () => new Set(visibleResources.map((r) => r.id)),
    [visibleResources]
  );

  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node<ResourceNodeData>[] = visibleResources.map((r) => ({
      id: r.id,
      type: "resource",
      position: { x: 0, y: 0 },
      data: {
        name: r.name,
        vendorName: r.vendorName,
        category: r.category,
        lifecycleState: r.lifecycleState,
        isOrphan: highlightOrphans && !connectedIds.has(r.id),
      },
      draggable: true,
    }));

    const rawEdges: Edge[] = relationships
      .filter(
        (rel) =>
          visibleResourceIds.has(rel.sourceResourceId) &&
          visibleResourceIds.has(rel.targetResourceId)
      )
      .map((rel) => {
        const style = EDGE_STYLE[rel.relationshipType] ?? {
          stroke: "#94a3b8",
          label: rel.relationshipType.replace(/_/g, " "),
        };
        return {
          id: rel.id,
          source: rel.sourceResourceId,
          target: rel.targetResourceId,
          label: style.label,
          labelStyle: { fill: "#cbd5e1", fontSize: 11, fontWeight: 500 },
          labelBgStyle: { fill: "#0d0f14", stroke: "#1e2028", strokeWidth: 1 },
          labelBgPadding: [6, 4] as [number, number],
          labelBgBorderRadius: 4,
          style: { stroke: style.stroke, strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: style.stroke,
            width: 16,
            height: 16,
          },
        } satisfies Edge;
      });

    const laid = layoutGraph(rawNodes, rawEdges);
    return { nodes: laid, edges: rawEdges };
  }, [visibleResources, relationships, visibleResourceIds, connectedIds, highlightOrphans]);

  const onNodeClick: NodeMouseHandler = useCallback((_e, node) => {
    setSelectedId(node.id);
  }, []);

  const toggleState = (state: string) => {
    setHiddenStates((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  };

  if (resources.length === 0) {
    return <EmptyResources />;
  }

  return (
    <>
      <div className="relative rounded-xl border border-[#1e2028] bg-[#0a0b0e] h-[calc(100vh-12rem)] min-h-[520px] overflow-hidden">
        {/* Filter panel */}
        <div className="absolute top-3 left-3 z-10 rounded-lg border border-[#1e2028] bg-[#111318]/95 backdrop-blur p-3 w-56 shadow-lg">
          <Label className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            Lifecycle
          </Label>
          <ul className="mt-2 space-y-1.5">
            {LIFECYCLE_STATES.map((s) => {
              const checked = !hiddenStates.has(s.value);
              return (
                <li key={s.value}>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleState(s.value)}
                      className="rounded border-[#2a2d38] bg-[#1a1d26] text-blue-500 focus:ring-blue-500/30 w-3.5 h-3.5"
                    />
                    <span
                      className={
                        checked
                          ? "text-sm text-slate-200 group-hover:text-slate-100"
                          : "text-sm text-slate-500 group-hover:text-slate-300"
                      }
                    >
                      {s.label}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[#1e2028] mt-3 pt-3">
            <button
              type="button"
              onClick={() => setHighlightOrphans((v) => !v)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors w-full"
            >
              {highlightOrphans ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span>{highlightOrphans ? "Showing orphans" : "Orphans hidden"}</span>
            </button>
          </div>
        </div>

        {/* Add relationship */}
        <div className="absolute top-3 right-3 z-10">
          <Button onClick={() => setAddOpen(true)} size="sm">
            <PlusCircle className="w-4 h-4" /> Add relationship
          </Button>
        </div>

        {/* Banner: no relationships yet */}
        {relationships.length === 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs px-4 py-2 max-w-md text-center backdrop-blur">
            No relationships mapped yet — add one to start building your graph.
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e2028" gap={20} size={1} />
          <Controls
            position="bottom-right"
            className="!bg-[#111318] !border !border-[#1e2028] [&_button]:!bg-[#111318] [&_button]:!border-[#1e2028] [&_button:hover]:!bg-[#1a1d26] [&_svg]:!fill-slate-300"
          />
        </ReactFlow>
      </div>

      <AddRelationshipDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        resources={resources}
        defaultSourceId={selectedId ?? undefined}
        onCreated={() => {
          setAddOpen(false);
          router.refresh();
        }}
      />

      <ResourceDetailSheet
        resourceId={selectedId}
        workspaceId={workspaceId}
        projects={projects}
        onClose={() => setSelectedId(null)}
        onMutated={() => router.refresh()}
        onDeleted={() => {
          setSelectedId(null);
          router.refresh();
        }}
      />
    </>
  );
}

function EmptyResources() {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2028] bg-[#0d0f14] p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto">
        <Layers className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-100 mt-4">Nothing to map yet</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        Add resources to your registry and the dependency graph will populate
        automatically. Then connect them to surface ownership and decommission risk.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button asChild>
          <Link href="/registry">
            <GitBranch className="w-4 h-4" /> Open registry
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function GraphView(props: Props) {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  );
}

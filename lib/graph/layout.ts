import dagre from "@dagrejs/dagre";
import type { Edge, Node } from "reactflow";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 92;

export function layoutGraph<T>(
  nodes: Node<T>[],
  edges: Edge[]
): Node<T>[] {
  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    ranksep: 120,
    nodesep: 60,
    edgesep: 24,
    marginx: 24,
    marginy: 24,
  });

  for (const n of nodes) {
    g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const e of edges) {
    // dagre tolerates references to unknown nodes by ignoring them
    if (g.hasNode(e.source) && g.hasNode(e.target)) {
      g.setEdge(e.source, e.target);
    }
  }

  dagre.layout(g);

  return nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return {
      ...n,
      position: { x: x - NODE_WIDTH / 2, y: y - NODE_HEIGHT / 2 },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };
  });
}

export const GRAPH_NODE_WIDTH = NODE_WIDTH;
export const GRAPH_NODE_HEIGHT = NODE_HEIGHT;

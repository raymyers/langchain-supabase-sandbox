"use client"
import ELK, { ElkExtendedEdge, ElkNode } from "elkjs";

const nodeWidth = 172;
const nodeHeight = 36;
const elk = new ELK();
export const elkLayout = (nodes: ElkNode[], edges: ElkExtendedEdge[]) => {
  const nodesForElk = nodes.map((node: ElkNode) => {
    return {
      ...node,
      width: nodeWidth,
      height: nodeHeight,
    };
  });

  const graph : ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "nodePlacement.strategy": "SIMPLE",
    },
    children: nodesForElk,
    edges: edges,
  };
  return elk.layout(graph);
};



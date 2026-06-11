import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import InputNode from './nodes/InputNode';
import FormulaNode from './nodes/FormulaNode';
import OutputNode from './nodes/OutputNode';
import { evaluateGraph, type CanvasNodeData, type GraphNode, type GraphEdge } from '../../lib/mathCanvas';

const nodeTypes: NodeTypes = {
  input: InputNode,
  formula: FormulaNode,
  output: OutputNode,
};

/** Firma de las definiciones (sin result/error) para disparar el recálculo sin bucles. */
function definitionSignature(nodes: Node[], edges: Edge[]): string {
  const n = nodes.map((x) => {
    const d = x.data as CanvasNodeData;
    return [x.id, x.type, d.varName, d.value, d.unit, d.expr, d.targetUnit];
  });
  const e = edges.map((x) => [x.source, x.target]);
  return JSON.stringify({ n, e });
}

let idCounter = 0;
const nextId = () => `n${++idCounter}`;

function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const updateNodeData = useCallback(
    (id: string, patch: Partial<CanvasNodeData>) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes],
  );

  const addNode = useCallback(
    (type: 'input' | 'formula' | 'output') => {
      const id = nextId();
      const defaults: Record<string, CanvasNodeData> = {
        input: { varName: '', value: '', unit: '' },
        formula: { varName: '', expr: '' },
        output: { targetUnit: '' },
      };
      const node: Node = {
        id,
        type,
        position: { x: 80 + Math.random() * 240, y: 80 + Math.random() * 200 },
        data: { ...defaults[type] } as Record<string, unknown>,
      };
      setNodes((prev) => [...prev, node]);
    },
    [setNodes],
  );

  // Recalcula resultados cuando cambian las definiciones o las aristas.
  const signature = useMemo(() => definitionSignature(nodes, edges), [nodes, edges]);
  useEffect(() => {
    const results = evaluateGraph(nodes as unknown as GraphNode[], edges as unknown as GraphEdge[]);
    setNodes((prev) =>
      prev.map((n) => {
        const r = results[n.id] ?? {};
        if (n.data.result === r.result && n.data.error === r.error) return n;
        return { ...n, data: { ...n.data, result: r.result, error: r.error } };
      }),
    );
    // Depende solo de la firma de definiciones para evitar bucles de render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, setNodes]);

  // Inyecta el callback de edición en cada nodo en tiempo de render.
  const displayNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, onChange: (patch: Partial<CanvasNodeData>) => updateNodeData(n.id, patch) },
      })),
    [nodes, updateNodeData],
  );

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-3 z-10 flex gap-2 rounded-lg border border-border bg-surface/90 p-2 shadow-sm backdrop-blur">
        <button
          className="rounded bg-accent px-3 py-1 text-sm font-medium text-white hover:opacity-90"
          onClick={() => addNode('input')}
        >
          + Entrada
        </button>
        <button
          className="rounded bg-ink px-3 py-1 text-sm font-medium text-white hover:opacity-90"
          onClick={() => addNode('formula')}
        >
          + Fórmula
        </button>
        <button
          className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:opacity-90"
          onClick={() => addNode('output')}
        >
          + Salida
        </button>
      </div>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function MathCanvas() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}

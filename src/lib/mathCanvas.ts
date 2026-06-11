// Motor de cálculo del canvas matemático.
// Lógica pura (sin React): recibe los nodos y aristas de React Flow y devuelve,
// por cada nodo, el resultado formateado o un mensaje de error.
//
// Tres tipos de nodo (node.type):
//   - 'input'   : un valor con unidad opcional, expuesto como variable `varName`.
//   - 'formula' : una expresión math.js que referencia variables por nombre.
//   - 'output'  : muestra el resultado del nodo conectado, convertido a `targetUnit`.

import { create, all } from 'mathjs';

const math = create(all, {});

export type NodeKind = 'input' | 'formula' | 'output';

export interface CanvasNodeData {
  /** Nombre de variable expuesto por nodos input/formula. */
  varName?: string;
  /** Valor crudo del nodo input (ej. "420"). */
  value?: string;
  /** Unidad del nodo input (ej. "MPa", "mm^2"). Vacío = adimensional. */
  unit?: string;
  /** Expresión math.js del nodo formula (ej. "As*fy*(d-a/2)"). */
  expr?: string;
  /** Unidad objetivo del nodo output (ej. "kN*m"). Vacío = unidad natural. */
  targetUnit?: string;
}

export interface GraphNode {
  id: string;
  type?: string;
  data: CanvasNodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface NodeResult {
  /** Resultado formateado para mostrar. */
  result?: string;
  /** Mensaje de error (unidad incoherente, variable indefinida, ciclo, etc.). */
  error?: string;
}

export type GraphResults = Record<string, NodeResult>;

/** Detecta los nodos que forman parte de algún ciclo en el grafo dirigido de aristas. */
function findNodesInCycles(nodes: GraphNode[], edges: GraphEdge[]): Set<string> {
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.source)?.push(e.target);

  const inCycle = new Set<string>();
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  for (const n of nodes) color.set(n.id, WHITE);
  const stack: string[] = [];

  const visit = (id: string) => {
    color.set(id, GRAY);
    stack.push(id);
    for (const next of adj.get(id) ?? []) {
      if (color.get(next) === GRAY) {
        // Arista de retorno: marca todo el tramo del stack desde `next`.
        const from = stack.lastIndexOf(next);
        if (from !== -1) for (const node of stack.slice(from)) inCycle.add(node);
      } else if (color.get(next) === WHITE) {
        visit(next);
      }
    }
    stack.pop();
    color.set(id, BLACK);
  };

  for (const n of nodes) if (color.get(n.id) === WHITE) visit(n.id);
  return inCycle;
}

/** Formatea un valor de math.js a texto legible (números, unidades, etc.). */
function formatValue(value: unknown): string {
  return math.format(value, { precision: 5 });
}

/**
 * Evalúa el grafo completo y devuelve el resultado o error de cada nodo.
 * No requiere orden topológico: itera varias pasadas para resolver fórmulas
 * que dependen de otras fórmulas.
 */
export function evaluateGraph(nodes: GraphNode[], edges: GraphEdge[]): GraphResults {
  const results: GraphResults = {};
  const inCycle = findNodesInCycles(nodes, edges);

  // Scope compartido (nombre de variable -> valor math.js) y crudo por nodo.
  const scope: Record<string, unknown> = {};
  const rawByNode = new Map<string, unknown>();

  // --- 1. Nodos input ---
  for (const node of nodes) {
    if (node.type !== 'input') continue;
    const { varName, value, unit } = node.data;
    if (inCycle.has(node.id)) {
      results[node.id] = { error: 'Dependencia circular' };
      continue;
    }
    if (!varName) {
      results[node.id] = { error: 'Falta el nombre de variable' };
      continue;
    }
    if (value === undefined || value.trim() === '') {
      results[node.id] = { error: 'Falta el valor' };
      continue;
    }
    try {
      const expr = unit && unit.trim() ? `${value} ${unit}` : value;
      const evaluated = math.evaluate(expr);
      scope[varName] = evaluated;
      rawByNode.set(node.id, evaluated);
      results[node.id] = { result: formatValue(evaluated) };
    } catch (err) {
      results[node.id] = { error: errMsg(err) };
    }
  }

  // --- 2. Nodos formula (varias pasadas) ---
  const formulas = nodes.filter((n) => n.type === 'formula');
  const pending = new Set(formulas.map((n) => n.id));
  let lastError = new Map<string, string>();

  for (let pass = 0; pass < formulas.length + 1 && pending.size > 0; pass++) {
    let progressed = false;
    for (const node of formulas) {
      if (!pending.has(node.id)) continue;
      const { varName, expr } = node.data;
      if (inCycle.has(node.id)) {
        results[node.id] = { error: 'Dependencia circular' };
        pending.delete(node.id);
        continue;
      }
      if (!expr || expr.trim() === '') {
        results[node.id] = { error: 'Falta la expresión' };
        pending.delete(node.id);
        continue;
      }
      try {
        const evaluated = math.evaluate(expr, scope);
        if (varName) scope[varName] = evaluated;
        rawByNode.set(node.id, evaluated);
        results[node.id] = { result: formatValue(evaluated) };
        pending.delete(node.id);
        progressed = true;
      } catch (err) {
        // Puede ser que una variable aún no esté resuelta: reintentar en otra pasada.
        lastError.set(node.id, errMsg(err));
      }
    }
    if (!progressed) break;
  }
  // Fórmulas que nunca resolvieron (variable indefinida, error dimensional...).
  for (const id of pending) {
    results[id] = { error: lastError.get(id) ?? 'No se pudo evaluar' };
  }

  // --- 3. Nodos output ---
  for (const node of nodes) {
    if (node.type !== 'output') continue;
    if (inCycle.has(node.id)) {
      results[node.id] = { error: 'Dependencia circular' };
      continue;
    }
    const incoming = edges.find((e) => e.target === node.id);
    if (!incoming) {
      results[node.id] = { error: 'Sin entrada conectada' };
      continue;
    }
    if (!rawByNode.has(incoming.source)) {
      results[node.id] = { error: 'La entrada no tiene un valor válido' };
      continue;
    }
    const raw = rawByNode.get(incoming.source);
    const target = node.data.targetUnit?.trim();
    try {
      if (target) {
        // .to() lanza si las unidades son incoherentes — el chequeo dimensional clave.
        const converted = (raw as { to: (u: string) => unknown }).to(target);
        results[node.id] = { result: formatValue(converted) };
      } else {
        results[node.id] = { result: formatValue(raw) };
      }
    } catch (err) {
      results[node.id] = { error: errMsg(err) };
    }
  }

  return results;
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

import type { CanvasNodeData } from '../../lib/mathCanvas';

/**
 * Datos que viajan en `node.data` de cada nodo de React Flow: la definición
 * editable (CanvasNodeData), el resultado/error calculado por `evaluateGraph`,
 * y el callback para editar los campos del nodo.
 */
export interface NodeView extends CanvasNodeData {
  result?: string;
  error?: string;
  onChange?: (patch: Partial<CanvasNodeData>) => void;
}

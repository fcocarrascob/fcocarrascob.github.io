import type { Notebook, Cell } from '@/types/notebook'
import { CELL_WIDTH } from '@/store/notebookStore'

function makeId() {
  return `example-${Math.random().toString(36).slice(2, 9)}`
}

const now = new Date().toISOString()

type CellSeed = Pick<Cell, 'id' | 'type' | 'content'>

/** Layout helper: stack cells vertically starting at y=80, step=100px */
function layout(seeds: CellSeed[]): Cell[] {
  return seeds.map((c, i) => ({
    ...c,
    x: 80,
    y: 80 + i * 100,
    width: CELL_WIDTH,
  }))
}

/**
 * Predefined example notebooks for the canvas notepad.
 */
export const EXAMPLE_NOTEBOOKS: Omit<Notebook, 'id'>[] = [
  {
    title: '📐 Geometría básica',
    createdAt: now,
    updatedAt: now,
    cells: layout([
      { id: makeId(), type: 'text',       content: 'Área y perímetro de un círculo' },
      { id: makeId(), type: 'expression', content: 'radio = 5' },
      { id: makeId(), type: 'expression', content: 'area = pi * radio^2' },
      { id: makeId(), type: 'expression', content: 'perimetro = 2 * pi * radio' },
      { id: makeId(), type: 'expression', content: 'base = 6' },
      { id: makeId(), type: 'expression', content: 'altura = 4' },
      { id: makeId(), type: 'expression', content: 'area_triangulo = (base * altura) / 2' },
    ]),
  },
  {
    title: '🌡️ Conversión de unidades',
    createdAt: now,
    updatedAt: now,
    cells: layout([
      { id: makeId(), type: 'text',       content: 'Conversiones de temperatura' },
      { id: makeId(), type: 'expression', content: 'temp_C = 100 degC' },
      { id: makeId(), type: 'expression', content: 'temp_F = temp_C to degF' },
      { id: makeId(), type: 'expression', content: 'temp_K = temp_C to K' },
      { id: makeId(), type: 'expression', content: 'distancia = 120 km' },
      { id: makeId(), type: 'expression', content: 'tiempo = 1.5 h' },
      { id: makeId(), type: 'expression', content: 'velocidad = distancia / tiempo' },
    ]),
  },
  {
    title: '📊 Fórmula cuadrática',
    createdAt: now,
    updatedAt: now,
    cells: layout([
      { id: makeId(), type: 'text',       content: 'Ecuación cuadrática: ax² + bx + c = 0' },
      { id: makeId(), type: 'expression', content: 'a = 1' },
      { id: makeId(), type: 'expression', content: 'b = -5' },
      { id: makeId(), type: 'expression', content: 'c = 6' },
      { id: makeId(), type: 'expression', content: 'discriminante = b^2 - 4*a*c' },
      { id: makeId(), type: 'expression', content: 'x1 = (-b + sqrt(discriminante)) / (2*a)' },
      { id: makeId(), type: 'expression', content: 'x2 = (-b - sqrt(discriminante)) / (2*a)' },
    ]),
  },
]

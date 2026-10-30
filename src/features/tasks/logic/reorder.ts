import type { Task } from '../types'

export interface TaskOrder {
  readonly id: string
  readonly order: number
}

const STEP = 1000

/** Orden total y estable: `order`, luego creación, luego id (desempata duplicados). */
export const byOrder = (a: Task, b: Task) =>
  a.order - b.order || a.createdAt - b.createdAt || a.id.localeCompare(b.id)

/**
 * Calcula las escrituras mínimas al mover `activeId` a la posición de `overId` dentro de la lista visible.
 * Las tareas ocultas por filtros conservan su lugar: la nueva secuencia visible solo rellena los huecos
 * que ya ocupaban las visibles. Devuelve [] si nada cambia.
 */
export function planReorder(
  all: readonly Task[],
  visible: readonly Task[],
  activeId: string,
  overId: string,
): TaskOrder[] {
  const from = visible.findIndex((task) => task.id === activeId)
  const to = visible.findIndex((task) => task.id === overId)
  if (from < 0 || to < 0 || from === to) return []

  const moved = [...visible]
  moved.splice(to, 0, ...moved.splice(from, 1))

  const sorted = [...all].sort(byOrder)
  const shown = new Set(visible.map((task) => task.id))
  const byId = new Map(moved.map((task) => [task.id, task]))
  let cursor = 0
  const next = sorted.map((task) => (shown.has(task.id) ? (byId.get(moved[cursor++]!.id) ?? task) : task))

  // Si hay órdenes repetidos, intercambiar valores no cambiaría nada: se renumera toda la secuencia.
  const distinct = sorted.every((task, index) => index === 0 || task.order > sorted[index - 1]!.order)
  return next.flatMap((task, index) => {
    const order = distinct ? sorted[index]!.order : (index + 1) * STEP
    return task.order === order ? [] : [{ id: task.id, order }]
  })
}

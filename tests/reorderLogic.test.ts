import { planReorder } from '@/features/tasks/logic/reorder'
import { sortTasks } from '@/features/tasks/logic/sortTasks'
import { task } from './tasks/memoryRepository'

const t = (id: string, order: number, over = {}) => task(id, { order, createdAt: order, ...over })
const ids = (list: { id: string }[]) => list.map((item) => item.id)

describe('planReorder', () => {
  const all = [t('a', 10), t('b', 20), t('c', 30)]

  it('intercambia solo los valores de las tareas afectadas', () => {
    expect(planReorder(all, all, 'c', 'a')).toEqual([
      { id: 'c', order: 10 }, { id: 'a', order: 20 }, { id: 'b', order: 30 },
    ])
    expect(planReorder(all, all, 'a', 'b')).toEqual([{ id: 'b', order: 10 }, { id: 'a', order: 20 }])
  })

  it('no escribe nada si no cambia, con una sola tarea, lista vacía o ids inexistentes', () => {
    expect(planReorder(all, all, 'b', 'b')).toEqual([])
    expect(planReorder([t('a', 1)], [t('a', 1)], 'a', 'a')).toEqual([])
    expect(planReorder([], [], 'a', 'b')).toEqual([])
    expect(planReorder(all, all, 'a', 'zzz')).toEqual([])
  })

  it('con filtros, las tareas ocultas conservan su posición', () => {
    const visible = [all[0]!, all[2]!]
    const plan = planReorder(all, visible, 'c', 'a')
    expect(plan).toEqual([{ id: 'c', order: 10 }, { id: 'a', order: 30 }])
    expect(plan.some((p) => p.id === 'b')).toBe(false)
    const next = all.map((x) => ({ ...x, order: plan.find((p) => p.id === x.id)?.order ?? x.order }))
    expect(ids(sortTasks(next, 'custom'))).toEqual(['c', 'b', 'a'])
  })

  it('renumera si hay órdenes repetidos para que el movimiento sí tenga efecto', () => {
    const tie = [t('a', 5, { createdAt: 1 }), t('b', 5, { createdAt: 2 })]
    const plan = planReorder(tie, tie, 'b', 'a')
    const next = tie.map((x) => ({ ...x, order: plan.find((p) => p.id === x.id)?.order ?? x.order }))
    expect(ids(sortTasks(next, 'custom'))).toEqual(['b', 'a'])
  })

  it('solo emite id y orden: no toca título, prioridad, fecha ni estado', () => {
    const mix = [t('a', 1, { completed: true, dueDate: '2030-01-01' }), t('b', 2), t('c', 3, { dueDate: '2020-01-01' })]
    const plan = planReorder(mix, mix, 'a', 'c')
    expect(plan.length).toBeGreaterThan(0)
    expect(plan.every((p) => Object.keys(p).sort().join() === 'id,order')).toBe(true)
  })

  it('una tarea nueva (order = ahora) queda al final y borrar no obliga a renumerar', () => {
    const list = [t('a', 10), t('b', 20), t('n', Date.now())]
    expect(ids(sortTasks(list, 'custom')).at(-1)).toBe('n')
    const rest = [list[0]!, list[2]!]
    expect(planReorder(rest, rest, 'n', 'a')).toHaveLength(2)
  })
})

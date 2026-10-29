import { act, renderHook } from '@testing-library/react'
import { daysFromToday, formatDueDate } from '@/features/tasks/logic/dates'
import { groupTasks } from '@/features/tasks/logic/groupTasks'
import { sortTasks } from '@/features/tasks/logic/sortTasks'
import { countTasks } from '@/features/tasks/logic/taskFilters'
import { useRideMascot } from '@/features/mascot/ride/useRideMascot'
import type { Task } from '@/features/tasks/types'

const TODAY = new Date(2026, 4, 14) // jueves 14 de mayo de 2026

const task = (id: string, over: Partial<Task> = {}): Task => ({
  id,
  title: id,
  description: '',
  priority: 'media',
  dueDate: null,
  completed: false,
  ...over,
})

describe('fechas relativas', () => {
  it('Hoy, Mañana, Ayer y fecha corta', () => {
    expect(formatDueDate('2026-05-14', TODAY)).toBe('Hoy')
    expect(formatDueDate('2026-05-15', TODAY)).toBe('Mañana')
    expect(formatDueDate('2026-05-13', TODAY)).toBe('Ayer')
    expect(formatDueDate('2026-05-22', TODAY)).toMatch(/^Vie, 22 may/)
    expect(daysFromToday('2026-05-21', TODAY)).toBe(7)
  })
})

describe('groupTasks', () => {
  it('agrupa por vencimiento y omite grupos vacíos', () => {
    const list = [
      task('a', { dueDate: '2026-05-14' }),
      task('b', { dueDate: '2026-05-16' }),
      task('c', { dueDate: '2026-06-30' }),
      task('d'),
      task('e', { dueDate: '2026-05-01' }),
      task('f', { dueDate: '2026-05-01', completed: true }),
    ]
    const groups = groupTasks(list, TODAY)
    expect(groups.map((g) => g.label)).toEqual(['Vencidas', 'Hoy', 'Esta semana', 'Más adelante', 'Sin fecha', 'Anteriores'])
    expect(groups.find((g) => g.key === 'overdue')?.tasks.map((t) => t.id)).toEqual(['e'])
    expect(groupTasks([], TODAY)).toEqual([])
  })
})

describe('sortTasks y contadores', () => {
  const list = [
    task('b', { priority: 'baja', dueDate: '2026-05-20' }),
    task('a', { priority: 'alta' }),
    task('c', { priority: 'media', dueDate: '2026-05-15', completed: true }),
  ]

  it('ordena por fecha (sin fecha al final), prioridad y título', () => {
    expect(sortTasks(list, 'due').map((t) => t.id)).toEqual(['c', 'b', 'a'])
    expect(sortTasks(list, 'priority').map((t) => t.id)).toEqual(['a', 'c', 'b'])
    expect(sortTasks(list, 'title').map((t) => t.id)).toEqual(['a', 'b', 'c'])
    expect(list.map((t) => t.id)).toEqual(['b', 'a', 'c'])
  })

  it('cuenta total, pendientes y completadas', () => {
    expect(countTasks(list)).toEqual({ total: 3, pending: 2, completed: 1 })
    expect(countTasks([])).toEqual({ total: 0, pending: 0, completed: 0 })
  })
})

describe('useRideMascot', () => {
  it('sube a la bici una vez y luego sigue el progreso; sin duplicar la celebración', () => {
    const { result, rerender } = renderHook(({ done }: { done: number }) => useRideMascot({ total: 4, completed: done }), {
      initialProps: { done: 4 },
    })
    expect(result.current.clip).toBe('ride-mount')
    act(() => result.current.onClipFinished('ride-mount'))
    expect(result.current.clip).toBe('ride-celebrate')
    rerender({ done: 3 })
    expect(result.current.clip).toBe('ride')
    expect(result.current.speed).toBeGreaterThan(1)
    rerender({ done: 2 })
    const slower = result.current.speed
    rerender({ done: 3 })
    expect(result.current.speed).toBeGreaterThan(slower)
  })

  it('con movimiento reducido salta el montaje', () => {
    const { result } = renderHook(() => useRideMascot({ total: 4, completed: 0 }, { reducedMotion: true }))
    expect(result.current.clip).toBe('ride-idle')
  })
})

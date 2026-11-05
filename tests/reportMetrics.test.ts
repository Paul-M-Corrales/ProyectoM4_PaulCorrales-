import { computeMetrics, percentOf, UPCOMING_LIMIT } from '@/features/reports/logic/metrics'
import { groupTasks } from '@/features/tasks/logic/groupTasks'
import { countTasks } from '@/features/tasks/logic/taskFilters'
import { task } from './tasks/memoryRepository'

const TODAY = new Date(2030, 5, 15, 12)

describe('métricas de reportes', () => {
  it('con cero tareas todo es 0, sin división por cero ni NaN', () => {
    const m = computeMetrics([], TODAY)
    expect(m).toMatchObject({ total: 0, completed: 0, pending: 0, overdue: 0, percent: 0, upcoming: [] })
    expect(m.byPriority.map((p) => p.total)).toEqual([0, 0, 0])
    expect(percentOf(0, 0)).toBe(0)
    expect(Number.isNaN(percentOf(0, 0))).toBe(false)
  })

  it('cuenta completadas y pendientes y redondea el porcentaje como el anillo de Mis tareas', () => {
    const tasks = [task('a', { completed: true }), task('b'), task('c')]
    expect(computeMetrics(tasks, TODAY)).toMatchObject({ total: 3, completed: 1, pending: 2, percent: 33 })
    expect(computeMetrics([task('a', { completed: true })], TODAY).percent).toBe(100)
    expect(percentOf(2, 3)).toBe(67)
  })

  it('usa las mismas definiciones que Mis tareas (contadores y grupo «Vencidas»)', () => {
    const tasks = [
      task('vieja', { dueDate: '2030-06-01' }),
      task('vieja-hecha', { dueDate: '2030-06-01', completed: true }),
      task('hoy', { dueDate: '2030-06-15' }),
      task('sin-fecha'),
    ]
    const m = computeMetrics(tasks, TODAY)
    const overdueInList = groupTasks(tasks, TODAY).find((g) => g.key === 'overdue')?.tasks.length ?? 0
    expect(m.overdue).toBe(1)
    expect(m.overdue).toBe(overdueInList)
    const counts = countTasks(tasks)
    expect([m.total, m.completed, m.pending]).toEqual([counts.total, counts.completed, counts.pending])
  })

  it('una tarea vencida completada o de hoy no cuenta como vencida', () => {
    expect(computeMetrics([task('a', { dueDate: '2030-06-14', completed: true })], TODAY).overdue).toBe(0)
    expect(computeMetrics([task('a', { dueDate: '2030-06-15' })], TODAY).overdue).toBe(0)
    expect(computeMetrics([task('a', { dueDate: '2030-06-14' })], TODAY).overdue).toBe(1)
  })

  it('distribuye por prioridad con totales, pendientes y completadas', () => {
    const tasks = [
      task('a', { priority: 'alta' }),
      task('b', { priority: 'alta', completed: true }),
      task('c', { priority: 'baja' }),
    ]
    expect(computeMetrics(tasks, TODAY).byPriority).toEqual([
      { priority: 'alta', total: 2, completed: 1, pending: 1 },
      { priority: 'media', total: 0, completed: 0, pending: 0 },
      { priority: 'baja', total: 1, completed: 0, pending: 1 },
    ])
  })

  it('próximos vencimientos: solo pendientes de hoy en adelante, por fecha y prioridad, con tope', () => {
    const tasks = [
      task('pasada', { dueDate: '2030-06-01' }),
      task('hecha', { dueDate: '2030-06-16', completed: true }),
      task('sin-fecha'),
      task('lejos', { dueDate: '2030-09-01' }),
      task('hoy-baja', { dueDate: '2030-06-15', priority: 'baja' }),
      task('hoy-alta', { dueDate: '2030-06-15', priority: 'alta' }),
      ...Array.from({ length: 6 }, (_, i) => task(`x${i}`, { dueDate: `2030-07-0${i + 1}` })),
    ]
    const ids = computeMetrics(tasks, TODAY).upcoming.map((t) => t.id)
    expect(ids.slice(0, 2)).toEqual(['hoy-alta', 'hoy-baja'])
    expect(ids).toHaveLength(UPCOMING_LIMIT)
    expect(ids).not.toContain('pasada')
    expect(ids).not.toContain('hecha')
    expect(ids).not.toContain('sin-fecha')
  })
})

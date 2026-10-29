import { formatDueDate, isOverdue } from '@/features/tasks/logic/dates'
import { filterTasks, progressOf } from '@/features/tasks/logic/taskFilters'
import { validateDraft } from '@/features/tasks/logic/validateDraft'
import type { Task } from '@/features/tasks/types'

const task = (over: Partial<Task>): Task => ({
  id: 'x',
  title: 'Tarea',
  description: '',
  priority: 'media',
  dueDate: null,
  completed: false,
  ...over,
})

const LIST = [
  task({ id: '1', title: 'Preparar informe', completed: true }),
  task({ id: '2', title: 'Llamar al médico', description: 'Pedir turno' }),
]

describe('filterTasks', () => {
  it('filtra por estado', () => {
    expect(filterTasks(LIST, 'pending', '').map((t) => t.id)).toEqual(['2'])
    expect(filterTasks(LIST, 'completed', '').map((t) => t.id)).toEqual(['1'])
    expect(filterTasks(LIST, 'all', '')).toHaveLength(2)
  })

  it('busca sin distinguir mayúsculas ni tildes, en título y descripción', () => {
    expect(filterTasks(LIST, 'all', 'MEDICO').map((t) => t.id)).toEqual(['2'])
    expect(filterTasks(LIST, 'all', 'turno').map((t) => t.id)).toEqual(['2'])
    expect(filterTasks(LIST, 'all', 'zzz')).toEqual([])
  })
})

describe('progressOf', () => {
  it('cuenta tareas reales; lista vacía = 0 de 0', () => {
    expect(progressOf([])).toEqual({ total: 0, completed: 0 })
    expect(progressOf(LIST)).toEqual({ total: 2, completed: 1 })
  })
})

describe('fechas y validación', () => {
  it('formatea sin desfase de zona horaria y detecta vencidas', () => {
    expect(formatDueDate('2026-03-05')).toMatch(/5/)
    expect(isOverdue('2026-03-05', new Date(2026, 2, 6))).toBe(true)
    expect(isOverdue('2026-03-06', new Date(2026, 2, 6))).toBe(false)
  })

  it('exige título y limita longitudes', () => {
    const base = { title: 'ok', description: '', priority: 'alta', dueDate: null } as const
    expect(validateDraft(base)).toEqual({})
    expect(validateDraft({ ...base, title: '   ' }).title).toBeDefined()
    expect(validateDraft({ ...base, description: 'a'.repeat(501) }).description).toBeDefined()
    expect(validateDraft({ ...base, dueDate: '5/3' }).dueDate).toBeDefined()
  })
})

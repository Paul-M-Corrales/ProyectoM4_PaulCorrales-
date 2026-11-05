import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { PAST_DUE_MESSAGE } from '@/features/tasks/logic/localDate'
import { memoryRepository, task } from './tasks/memoryRepository'
import { openTasks } from './tasks/openTasks'

// Hoy (calendario local) = 15/06/2030. Solo se simula Date: los temporizadores de la UI siguen reales.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2030, 5, 15, 23, 30))
})
afterEach(() => vi.useRealTimers())

const setDate = (value: string) => fireEvent.change(screen.getByLabelText(/Fecha límite/), { target: { value } })
const save = () => userEvent.setup({ advanceTimers: () => {} }).click(screen.getByRole('button', { name: 'Guardar tarea' }))

async function openNew() {
  const repo = memoryRepository()
  openTasks(repo)
  await userEvent.click(await screen.findByRole('button', { name: /Nueva tarea/ }))
  await userEvent.type(screen.getByRole('textbox', { name: /^Título/ }), 'Estudiar')
  return repo
}

describe('fecha límite al crear una tarea', () => {
  it('rechaza ayer con un mensaje claro y no guarda', async () => {
    const repo = await openNew()
    setDate('2030-06-14')
    await save()
    expect(await screen.findByText(PAST_DUE_MESSAGE)).toBeInTheDocument()
    expect(repo.calls.create).toEqual([])
    expect(screen.getByLabelText(/Fecha límite/)).toHaveAttribute('min', '2030-06-15')
  })

  it.each([['hoy', '2030-06-15'], ['una fecha futura', '2031-01-10'], ['sin vencimiento', '']])(
    'permite %s',
    async (_name, value) => {
      const repo = await openNew()
      if (value) setDate(value)
      await save()
      await waitFor(() => expect(repo.calls.create).toHaveLength(1))
      expect(repo.calls.create[0]).toMatchObject({ dueDate: value || null })
    },
  )
})

describe('edición de una tarea ya vencida', () => {
  const overdue = task('v', { title: 'Vencida', dueDate: '2030-06-01' })

  async function openEdit() {
    const repo = memoryRepository([overdue])
    openTasks(repo)
    expect(await screen.findByText('Vencida')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Editar «Vencida»/ }))
    return repo
  }

  it('sigue visible y se puede editar otro campo conservando su fecha vencida', async () => {
    const repo = await openEdit()
    expect(screen.getByLabelText(/Fecha límite/)).toHaveAttribute('min', '2030-06-01')
    await userEvent.clear(screen.getByRole('textbox', { name: /^Título/ }))
    await userEvent.type(screen.getByRole('textbox', { name: /^Título/ }), 'Vencida y renombrada')
    await save()
    await waitFor(() => expect(repo.calls.update).toHaveLength(1))
    expect(repo.calls.update[0]).toMatchObject({ id: 'v', changes: { dueDate: '2030-06-01', title: 'Vencida y renombrada' } })
  })

  it('rechaza cambiarla a otra fecha pasada, pero admite hoy o sin fecha', async () => {
    const repo = await openEdit()
    setDate('2030-06-10')
    await save()
    expect(await screen.findByText(PAST_DUE_MESSAGE)).toBeInTheDocument()
    expect(repo.calls.update).toEqual([])
    setDate('2030-06-15')
    await save()
    await waitFor(() => expect(repo.calls.update).toHaveLength(1))
  })
})

describe('última barrera en useTasks (aunque se eluda el formulario)', () => {
  it('rechaza crear o reasignar fechas pasadas sin llegar al repositorio', async () => {
    const repo = memoryRepository([task('v', { dueDate: '2030-06-01' })])
    const { result } = renderHook(() => useTasks(repo))
    const draft = { title: 'x', description: '', priority: 'media', dueDate: '2030-06-14' } as const
    await expect(result.current.create(draft)).resolves.toEqual({ ok: false, message: PAST_DUE_MESSAGE })
    await expect(result.current.update('v', { dueDate: '2030-06-10' })).resolves.toEqual({ ok: false, message: PAST_DUE_MESSAGE })
    expect(repo.calls.create).toEqual([])
    expect(repo.calls.update).toEqual([])
  })

  it('permite completar, conservar la fecha vencida, borrar y crear con hoy', async () => {
    const repo = memoryRepository([task('v', { dueDate: '2030-06-01' })])
    const { result } = renderHook(() => useTasks(repo))
    await act(async () => {
      await result.current.update('v', { completed: true })
      await result.current.update('v', { dueDate: '2030-06-01', title: 'Otro' })
      await result.current.remove('v')
      await result.current.create({ title: 'x', description: '', priority: 'media', dueDate: '2030-06-15' })
    })
    expect(repo.calls.update).toHaveLength(2)
    expect(repo.calls.remove).toEqual(['v'])
    expect(repo.calls.create).toHaveLength(1)
  })
})

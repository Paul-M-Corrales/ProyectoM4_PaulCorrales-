import { act, screen, within } from '@testing-library/react'
import { AppRoutes } from '@/app/AppRoutes'
import { TaskRepositoryContext } from '@/features/tasks/context/taskRepositoryContext'
import type { TaskRepository } from '@/features/tasks/services/taskRepository'
import { fakeGateway, renderWithAuth, USER } from './auth/helpers'
import { memoryRepository, task, type MemoryRepository } from './tasks/memoryRepository'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2030, 5, 15, 12))
})
afterEach(() => vi.useRealTimers())

function openReports(repository: TaskRepository) {
  const gateway = fakeGateway()
  renderWithAuth(
    <TaskRepositoryContext value={() => repository}>
      <AppRoutes />
    </TaskRepositoryContext>,
    gateway,
    '/reportes',
  )
  act(() => gateway.emit(USER))
}
const kpi = (label: string) => within(screen.getByRole('list', { name: 'Indicadores principales' })).getByText(label).closest('li')

const SAMPLE = [
  task('a', { title: 'Entregar proyecto', priority: 'alta', dueDate: '2030-06-20' }),
  task('b', { priority: 'media', completed: true }),
  task('c', { priority: 'baja', dueDate: '2030-06-01' }),
]

describe('Reportes con datos reales', () => {
  it('muestra métricas, distribución por prioridad y próximos vencimientos', async () => {
    openReports(memoryRepository(SAMPLE))
    expect(await screen.findByRole('heading', { name: 'Reportes' })).toBeInTheDocument()
    expect(kpi('Total de tareas')).toHaveTextContent('3')
    expect(kpi('Completadas')).toHaveTextContent('1')
    expect(kpi('Pendientes')).toHaveTextContent('2')
    expect(kpi('Vencidas')).toHaveTextContent('1')
    expect(kpi('Completado')).toHaveTextContent('33%')
    expect(screen.getByRole('progressbar', { name: /completadas/ })).toHaveAttribute('aria-valuenow', '33')
    expect(screen.getByRole('img', { name: /Prioridad alta: 1 de 3/ })).toBeInTheDocument()
    const upcoming = screen.getByRole('region', { name: 'Próximos vencimientos' })
    expect(within(upcoming).getByText('Entregar proyecto')).toBeInTheDocument()
    expect(within(upcoming).queryByText('Tarea c')).not.toBeInTheDocument()
  })

  it('se actualiza cuando cambian los datos de Firestore', async () => {
    const repo: MemoryRepository = memoryRepository(SAMPLE)
    openReports(repo)
    await screen.findByRole('heading', { name: 'Reportes' })
    act(() => repo.push([...SAMPLE, task('d', { completed: true })]))
    expect(kpi('Total de tareas')).toHaveTextContent('4')
    expect(kpi('Completado')).toHaveTextContent('50%')
  })

  it('sin tareas muestra un estado vacío claro, sin cifras inventadas', async () => {
    openReports(memoryRepository([]))
    expect(await screen.findByText(/Todavía no tenés tareas/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Creá la primera' })).toHaveAttribute('href', '/tareas?nueva=1')
    expect(screen.queryByRole('list', { name: 'Indicadores principales' })).not.toBeInTheDocument()
  })

  it('muestra el estado de carga mientras Firestore no responde', async () => {
    const waiting: TaskRepository = { ...memoryRepository(), subscribe: () => () => {} }
    openReports(waiting)
    expect(await screen.findByText('Cargando tus reportes…')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Indicadores principales' })).not.toBeInTheDocument()
  })

  it('muestra el error de Firestore', async () => {
    const repo = memoryRepository()
    openReports(repo)
    await screen.findByText(/Todavía no tenés tareas/)
    act(() => repo.fail('No tenés permiso para esta operación.'))
    expect(await screen.findByRole('alert')).toHaveTextContent('No tenés permiso para esta operación.')
  })

  it('aclara que no hay evolución semanal por falta de fecha de finalización', async () => {
    openReports(memoryRepository(SAMPLE))
    expect(await screen.findByText(/no guardan la fecha en que se completaron/)).toBeInTheDocument()
  })
})

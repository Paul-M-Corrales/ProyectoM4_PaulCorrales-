import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/app/AppRoutes'
import { TaskRepositoryContext } from '@/features/tasks/context/taskRepositoryContext'
import { fakeGateway, renderWithAuth, USER } from './auth/helpers'
import { memoryRepository, task, type MemoryRepository } from './tasks/memoryRepository'
import { openTasks } from './tasks/openTasks'

const ring = () => screen.getByRole('progressbar', { name: 'Tareas completadas' })

describe('Mis tareas: vista, errores y cambio de usuario', () => {
  it('filtros y búsqueda no escriben y el total real no depende de lo visible', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository([
      task('a', { title: 'Alfa', completed: true }),
      task('b', { title: 'Beta', description: 'cuaderno' }),
    ])
    openTasks(repo)
    await screen.findByText('Alfa')
    await user.click(screen.getByRole('button', { name: /Completadas/ }))
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Todas/ }))
    await user.type(screen.getByRole('searchbox'), 'cuaderno')
    expect(screen.queryByText('Alfa')).not.toBeInTheDocument()
    expect(ring()).toHaveTextContent('1/2')
    expect(repo.calls).toEqual({ create: [], update: [], remove: [] })
  })

  it('ordena por prioridad y por creación', async () => {
    const user = userEvent.setup()
    openTasks(memoryRepository([
      task('a', { title: 'Vieja baja', priority: 'baja', createdAt: 1 }),
      task('b', { title: 'Nueva alta', priority: 'alta', createdAt: 2 }),
    ]))
    await screen.findByText('Vieja baja')
    const order = () => screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    await user.selectOptions(screen.getByRole('combobox', { name: /Ordenar por/ }), 'priority')
    expect(order()).toEqual(['Nueva alta', 'Vieja baja'])
    await user.selectOptions(screen.getByRole('combobox', { name: /Ordenar por/ }), 'created')
    expect(order()).toEqual(['Nueva alta', 'Vieja baja'])
  })

  it('muestra un error de permisos o conexión de la suscripción', async () => {
    const repo = memoryRepository()
    openTasks(repo)
    await screen.findByText('Todavía no tenés tareas')
    act(() => repo.fail('No hay conexión con el servidor. Revisá tu red e intentá de nuevo.'))
    expect(await screen.findByText(/No hay conexión con el servidor/)).toBeInTheDocument()
  })

  it('al cerrar sesión y entrar otro usuario no se mezclan tareas', async () => {
    const repos: Record<string, MemoryRepository> = {}
    const gateway = fakeGateway()
    renderWithAuth(
      <TaskRepositoryContext value={(uid) => (repos[uid ?? ''] ??= memoryRepository(uid === 'u1' ? [task('a', { title: 'De Ana' })] : []))}>
        <AppRoutes />
      </TaskRepositoryContext>,
      gateway,
      '/tareas',
    )
    act(() => gateway.emit(USER))
    expect(await screen.findByText('De Ana')).toBeInTheDocument()
    act(() => gateway.emit({ ...USER, uid: 'u2', email: 'beto@dominio.com' }))
    expect(await screen.findByText('Todavía no tenés tareas')).toBeInTheDocument()
    expect(screen.queryByText('De Ana')).not.toBeInTheDocument()
    expect(within(ring()).getByText('0/0')).toBeInTheDocument()
  })
})

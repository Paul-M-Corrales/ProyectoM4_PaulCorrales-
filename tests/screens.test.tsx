import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fakeGateway, renderApp, USER } from './auth/helpers'

async function openPrivate(path: string) {
  const gateway = fakeGateway()
  renderApp(gateway, path)
  act(() => gateway.emit(USER))
  return gateway
}

describe('navegación privada', () => {
  it('muestra las cuatro secciones y marca la actual', async () => {
    await openPrivate('/tareas')
    const nav = await screen.findByRole('navigation', { name: 'Principal' })
    for (const name of ['Inicio', 'Mis tareas', 'Reportes', 'Configuración']) {
      expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
    }
    expect(within(nav).getByRole('link', { name: 'Mis tareas' })).toHaveAttribute('aria-current', 'page')
  })

  it('navega entre pantallas con React Router', async () => {
    const user = userEvent.setup()
    await openPrivate('/inicio')
    await user.click(await screen.findByRole('link', { name: 'Reportes' }))
    expect(await screen.findByRole('heading', { name: 'Reportes' })).toBeInTheDocument()
    expect(screen.getByText(/todavía no están conectadas/)).toBeInTheDocument()
  })

  it('Configuración y Reportes son privadas', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/configuracion')
    act(() => gateway.emit(null))
    expect(await screen.findByRole('heading', { name: 'Entrá a tu rutina' })).toBeInTheDocument()
  })

  it('/dashboard antiguo redirige a Inicio', async () => {
    await openPrivate('/dashboard')
    expect(await screen.findByRole('heading', { level: 1, name: /Organizá tus tareas/ })).toBeInTheDocument()
  })
})

describe('Inicio', () => {
  it('ofrece destinos reales y las tres tarjetas', async () => {
    await openPrivate('/inicio')
    expect(await screen.findByRole('link', { name: 'Ir a Mis tareas' })).toHaveAttribute('href', '/tareas')
    expect(screen.getByRole('link', { name: 'Conocer funcionalidades' })).toHaveAttribute('href', '#funcionalidades')
    expect(screen.queryByText(/gratis/i)).not.toBeInTheDocument()
    for (const title of ['Organizá tus tareas', 'Sigue tu progreso', 'Enfocate de verdad']) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
    }
  })
})

describe('Mis tareas', () => {
  it('estado vacío honesto: sin tareas ficticias ni progreso inventado', async () => {
    await openPrivate('/tareas')
    expect(await screen.findByRole('heading', { name: 'Mis tareas' })).toBeInTheDocument()
    expect(screen.getByText('Todavía no tenés tareas')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Lista de tareas' })).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText(/de.*tareas completadas/)).toHaveTextContent('0 de 0')
  })

  it('tiene buscador, filtros y Nueva tarea', async () => {
    const user = userEvent.setup()
    await openPrivate('/tareas')
    expect(await screen.findByRole('searchbox')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Pendientes' }))
    expect(screen.getByRole('button', { name: 'Pendientes' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /Nueva tarea/ }))
    expect(screen.getByRole('textbox', { name: /^Título/ })).toBeVisible()
  })

  it('el formulario valida y, sin Firestore, avisa que no se guardó', async () => {
    const user = userEvent.setup()
    await openPrivate('/tareas')
    await user.click(await screen.findByRole('button', { name: /Nueva tarea/ }))
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))
    expect(await screen.findByText('Escribí un título para la tarea.')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: /^Título/ }), 'Estudiar')
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))
    expect(await screen.findByText(/todavía no está conectado/)).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Lista de tareas' })).not.toBeInTheDocument()
  })
})

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

  it('Reportes y Configuración son privadas', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/configuracion')
    act(() => gateway.emit(null))
    expect(await screen.findByRole('heading', { name: 'Entrá a tu rutina' })).toBeInTheDocument()
  })

  it('/dashboard antiguo redirige a Inicio', async () => {
    await openPrivate('/dashboard')
    expect(await screen.findByRole('heading', { level: 1, name: /Organizá mejor/ })).toBeInTheDocument()
  })

  it('el menú de cuenta ofrece cerrar sesión y no hay botón de registro', async () => {
    const user = userEvent.setup()
    await openPrivate('/inicio')
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByText(/registr|gratis/i)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Cuenta de/ }))
    expect(screen.getByText('ana@dominio.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  it('"Nueva tarea" de la barra abre el formulario en Mis tareas', async () => {
    const user = userEvent.setup()
    await openPrivate('/inicio')
    await user.click(await screen.findByRole('link', { name: 'Nueva tarea' }))
    expect(await screen.findByRole('textbox', { name: /^Título/ })).toBeVisible()
  })
})

describe('Inicio', () => {
  it('muestra los textos aprobados y destinos reales', async () => {
    await openPrivate('/inicio')
    const title = await screen.findByRole('heading', { level: 1 })
    expect(title).toHaveTextContent('Organizá mejor.')
    expect(title).toHaveTextContent('Avanzá todos los días.')
    expect(screen.getByText('Tu día, en movimiento')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mis tareas' })).toHaveAttribute('href', '/tareas')
    expect(screen.getByRole('link', { name: 'Ver cómo funciona' })).toHaveAttribute('href', '#como-funciona')
  })

  it('"Ver cómo funciona" apunta a una sección que existe, con las tres tarjetas', async () => {
    await openPrivate('/inicio')
    await screen.findByRole('heading', { level: 1 })
    const section = document.getElementById('como-funciona')
    expect(section).not.toBeNull()
    for (const text of [/Organizá\s*tus tareas/, /Visualizá\s*tu progreso/, /Mantené\s*el enfoque/]) {
      expect(within(section as HTMLElement).getByRole('heading', { level: 3, name: text })).toBeInTheDocument()
    }
  })
})

describe('Mis tareas', () => {
  it('estado vacío honesto: sin tareas ficticias ni progreso inventado', async () => {
    await openPrivate('/tareas')
    expect(await screen.findByRole('heading', { name: 'Mis tareas' })).toBeInTheDocument()
    expect(screen.getByText('Todavía no tenés tareas')).toBeInTheDocument()
    const ring = screen.getByRole('progressbar', { name: 'Tareas completadas' })
    expect(ring).toHaveAttribute('aria-valuenow', '0')
    expect(ring).toHaveTextContent('0/0')
    const summary = screen.getByRole('list', { name: 'Resumen de tareas' })
    expect(within(summary).getAllByText('0')).toHaveLength(3)
    expect(screen.getByText('Aún no hay datos')).toBeInTheDocument()
  })

  it('tiene buscador, filtros con contador, orden y vista', async () => {
    const user = userEvent.setup()
    await openPrivate('/tareas')
    expect(await screen.findByRole('searchbox')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Pendientes/ }))
    expect(screen.getByRole('button', { name: /Pendientes/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('combobox', { name: /Ordenar por/ })).toHaveValue('due')
    expect(screen.getByRole('option', { name: /Tablero/ })).toBeDisabled()
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
  })
})

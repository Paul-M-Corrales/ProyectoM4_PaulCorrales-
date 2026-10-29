import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fakeGateway, renderApp, USER } from './helpers'

const loginHeading = () => screen.findByRole('heading', { name: 'Entrá a tu rutina' })
const dashboardHeading = () => screen.findByRole('heading', { level: 1, name: /Organizá mejor/ })

describe('rutas y sesión', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('sesión inicial cargando: muestra estado de carga y no redirige todavía', () => {
    renderApp(fakeGateway(), '/inicio')
    expect(screen.getByRole('status')).toHaveTextContent(/Verificando tu sesión/)
    expect(screen.queryByRole('heading', { name: 'Entrá a tu rutina' })).not.toBeInTheDocument()
  })

  it('ruta privada sin sesión: redirige al login', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/inicio')
    act(() => gateway.emit(null))
    expect(await loginHeading()).toBeInTheDocument()
  })

  it('ruta privada con sesión restaurada: muestra Inicio con el usuario', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/inicio')
    act(() => gateway.emit(USER))
    expect(await dashboardHeading()).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mis tareas' })).toHaveAttribute('href', '/tareas')
  })

  it('con sesión, login y registro redirigen a Inicio', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/registro')
    act(() => gateway.emit(USER))
    expect(await dashboardHeading()).toBeInTheDocument()
  })

  it('en la raíz la sesión restaurada no monta el login (no repite la intro)', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/')
    expect(screen.queryByRole('heading', { name: 'Entrá a tu rutina' })).not.toBeInTheDocument()
    act(() => gateway.emit(USER))
    expect(await dashboardHeading()).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Entrá a tu rutina' })).not.toBeInTheDocument()
  })

  it('tras iniciar sesión vuelve a la ruta que se intentaba abrir', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/inicio')
    act(() => gateway.emit(null))
    expect(await loginHeading()).toBeInTheDocument()
    act(() => gateway.emit(USER))
    expect(await dashboardHeading()).toBeInTheDocument()
  })

  it('logout: llama al gateway y, al perderse la sesión, vuelve al login', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway()
    renderApp(gateway, '/inicio')
    act(() => gateway.emit(USER))
    await user.click(await screen.findByRole('button', { name: /Cuenta de/ }))
    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    expect(gateway.signOut).toHaveBeenCalledTimes(1)
    act(() => gateway.emit(null))
    expect(await loginHeading()).toBeInTheDocument()
  })

  it('si el logout falla, informa el error y deja reintentar', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway()
    vi.mocked(gateway.signOut).mockResolvedValue({ ok: false, code: 'network', message: 'Sin conexión.' })
    renderApp(gateway, '/inicio')
    act(() => gateway.emit(USER))
    await user.click(await screen.findByRole('button', { name: /Cuenta de/ }))
    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByText('Sin conexión.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeEnabled()
  })

  it('una ruta desconocida lleva al login', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/nada')
    act(() => gateway.emit(null))
    expect(await loginHeading()).toBeInTheDocument()
  })
})

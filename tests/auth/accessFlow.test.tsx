import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fakeGateway, renderApp, USER } from './helpers'

describe('acceso y registro', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('sin sesión: el login ofrece «Crear cuenta» y lleva al formulario de registro', async () => {
    const user = userEvent.setup()
    const gateway = fakeGateway()
    renderApp(gateway, '/')
    act(() => gateway.emit(null))
    await user.click(await screen.findByRole('link', { name: 'Crear cuenta' }))
    expect(await screen.findByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument()
  })

  it('con sesión persistida entra a Inicio sin pasar por el login (la sesión no se destruye)', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/')
    act(() => gateway.emit(USER))
    expect(await screen.findByRole('heading', { level: 1, name: /Organizá mejor/ })).toBeInTheDocument()
    expect(gateway.signOut).not.toHaveBeenCalled()
  })

  it('tras cerrar sesión el registro vuelve a estar disponible', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/inicio')
    act(() => gateway.emit(USER))
    await screen.findByRole('heading', { level: 1, name: /Organizá mejor/ })
    act(() => gateway.emit(null))
    expect(await screen.findByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro')
  })

  it('rutas privadas directas sin sesión redirigen al login; /registro y recuperar son públicas', async () => {
    for (const path of ['/tareas', '/reportes']) {
      const gateway = fakeGateway()
      const { unmount } = renderApp(gateway, path)
      act(() => gateway.emit(null))
      expect(await screen.findByRole('heading', { name: 'Entrá a tu rutina' })).toBeInTheDocument()
      unmount()
    }
    const gateway = fakeGateway()
    renderApp(gateway, '/recuperar-password')
    act(() => gateway.emit(null))
    expect(await screen.findByRole('button', { name: /enlace|recuperar|enviar/i })).toBeInTheDocument()
  })
})

describe('Inicio sin tarjetas flotantes', () => {
  it('no muestra «Mis tareas de hoy», «Progreso semanal» ni cifras ficticias', async () => {
    const gateway = fakeGateway()
    renderApp(gateway, '/inicio')
    act(() => gateway.emit(USER))
    await screen.findByRole('heading', { level: 1, name: /Organizá mejor/ })
    expect(screen.queryByText('Mis tareas de hoy')).not.toBeInTheDocument()
    expect(screen.queryByText('Progreso semanal')).not.toBeInTheDocument()
    expect(screen.queryByText('80%')).not.toBeInTheDocument()
    expect(screen.queryByText(/Ilustración de ejemplo/)).not.toBeInTheDocument()
  })
})

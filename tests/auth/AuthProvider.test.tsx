import { act, render, screen } from '@testing-library/react'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { fakeGateway, USER } from './helpers'

function Probe() {
  const { session } = useAuth()
  return <p data-testid="state">{session.status}</p>
}

const state = () => screen.getByTestId('state').textContent

describe('<AuthProvider />', () => {
  it('arranca en loading hasta que el proveedor responde', () => {
    render(
      <AuthProvider gateway={fakeGateway()}>
        <Probe />
      </AuthProvider>,
    )
    expect(state()).toBe('loading')
  })

  it('restaura una sesión existente', () => {
    const gateway = fakeGateway()
    render(
      <AuthProvider gateway={gateway}>
        <Probe />
      </AuthProvider>,
    )
    act(() => gateway.emit(USER))
    expect(state()).toBe('authenticated')
  })

  it('sin sesión pasa a unauthenticated y al cerrar sesión vuelve a ese estado', () => {
    const gateway = fakeGateway()
    render(
      <AuthProvider gateway={gateway}>
        <Probe />
      </AuthProvider>,
    )
    act(() => gateway.emit(USER))
    act(() => gateway.emit(null))
    expect(state()).toBe('unauthenticated')
  })

  it('un error del observer no deja la app cargando para siempre', () => {
    const gateway = fakeGateway()
    vi.mocked(gateway.onAuthChange).mockImplementation((_next, onError) => {
      onError?.()
      return () => {}
    })
    render(
      <AuthProvider gateway={gateway}>
        <Probe />
      </AuthProvider>,
    )
    expect(state()).toBe('unauthenticated')
  })

  it('desmonta el observer al desmontar el proveedor', () => {
    const gateway = fakeGateway()
    const { unmount } = render(
      <AuthProvider gateway={gateway}>
        <Probe />
      </AuthProvider>,
    )
    expect(gateway.unsubscribe).not.toHaveBeenCalled()
    unmount()
    expect(gateway.unsubscribe).toHaveBeenCalledTimes(1)
  })
})

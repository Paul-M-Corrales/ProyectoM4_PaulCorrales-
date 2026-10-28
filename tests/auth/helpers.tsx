import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from '@/app/AppRoutes'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import type { AuthGateway, AuthResult, AuthUser } from '@/features/auth/types'

export const USER: AuthUser = { uid: 'u1', email: 'ana@dominio.com', displayName: null }
export const OK: AuthResult = { ok: true }

export interface FakeGateway extends AuthGateway {
  emit(user: AuthUser | null): void
  unsubscribe: ReturnType<typeof vi.fn>
}

/** Gateway de mentira: el observer solo emite cuando el test lo decide. */
export function fakeGateway(result: AuthResult = OK): FakeGateway {
  let listener: (user: AuthUser | null) => void = () => {}
  const unsubscribe = vi.fn()
  return {
    signInWithEmail: vi.fn(() => Promise.resolve(result)),
    signInWithGoogle: vi.fn(() => Promise.resolve(result)),
    signUpWithEmail: vi.fn(() => Promise.resolve(result)),
    requestPasswordReset: vi.fn(() => Promise.resolve(result)),
    signOut: vi.fn(() => Promise.resolve(result)),
    onAuthChange: vi.fn((next) => {
      listener = next
      return unsubscribe
    }),
    emit: (user) => listener(user),
    unsubscribe,
  }
}

export function renderWithAuth(ui: ReactElement, gateway: AuthGateway, path = '/') {
  return render(
    <AuthProvider gateway={gateway}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </AuthProvider>,
  )
}

export function renderApp(gateway: AuthGateway, path = '/') {
  return renderWithAuth(<AppRoutes />, gateway, path)
}

/** Alertas del formulario; el fallback de la mascota sin WebGL también usa role="alert". */
export const formAlerts = () =>
  screen.queryAllByRole('alert').filter((element) => element.closest('form') !== null)

import type { AuthGateway, AuthResult } from '../types'

const pending: AuthResult = {
  ok: false,
  code: 'integration-pending',
  message: 'La integración con Firebase Authentication llega en ONGOING-M4-003. Todavía no se puede iniciar sesión.',
}

/** Gateway provisional: no simula éxito ni contacta servicios externos. */
export const pendingAuthGateway: AuthGateway = {
  signInWithEmail: () => Promise.resolve(pending),
  signInWithGoogle: () => Promise.resolve(pending),
  signUpWithEmail: () => Promise.resolve(pending),
  requestPasswordReset: () => Promise.resolve(pending),
}

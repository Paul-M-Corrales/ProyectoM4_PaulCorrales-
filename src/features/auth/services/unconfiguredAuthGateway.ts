import type { AuthGateway, AuthResult } from '../types'

export const NOT_CONFIGURED_MESSAGE =
  'La autenticación todavía no está configurada en este entorno. Completá las variables VITE_FIREBASE_* en .env.local y reiniciá el servidor.'

const notConfigured: AuthResult = {
  ok: false,
  code: 'not-configured',
  message: NOT_CONFIGURED_MESSAGE,
}

/** Gateway sin Firebase: nunca simula una sesión exitosa ni contacta servicios externos. */
export const unconfiguredAuthGateway: AuthGateway = {
  signInWithEmail: () => Promise.resolve(notConfigured),
  signInWithGoogle: () => Promise.resolve(notConfigured),
  signUpWithEmail: () => Promise.resolve(notConfigured),
  requestPasswordReset: () => Promise.resolve(notConfigured),
  signOut: () => Promise.resolve(notConfigured),
  onAuthChange: (next) => {
    queueMicrotask(() => next(null))
    return () => {}
  },
}

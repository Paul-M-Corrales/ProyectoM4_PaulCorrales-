import type { AuthAction, AuthFailure } from '../types'

export const RESET_NOTICE =
  'Si el correo está registrado, te enviamos un mensaje con las instrucciones para elegir una nueva contraseña.'

const GENERIC_SIGN_IN = 'El correo o la contraseña no son correctos.'
const GENERIC_SIGN_UP =
  'No pudimos crear la cuenta con esos datos. Si ya tenés una, iniciá sesión o recuperá tu contraseña.'

function failure(code: AuthFailure['code'], message: string): AuthFailure {
  return { ok: false, code, message }
}

export function errorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return ''
}

/** Códigos que significan "credenciales incorrectas"; se unifican para no revelar si el correo existe. */
const CREDENTIAL_CODES = new Set([
  'auth/invalid-credential',
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-login-credentials',
])

const COMMON: Record<string, AuthFailure> = {
  'auth/network-request-failed': failure('network', 'No hay conexión. Revisá tu internet e intentá de nuevo.'),
  'auth/too-many-requests': failure('rate-limited', 'Hubo demasiados intentos. Esperá unos minutos antes de volver a probar.'),
  'auth/invalid-email': failure('invalid-input', 'Ingresá un correo válido, por ejemplo nombre@dominio.com.'),
  'auth/weak-password': failure('invalid-input', 'La contraseña es muy débil. Usá al menos 8 caracteres.'),
  'auth/user-disabled': failure('invalid-credentials', 'Esta cuenta no está disponible. Contactá a soporte.'),
  'auth/operation-not-allowed': failure('unknown', 'Este método de acceso no está habilitado todavía.'),
  'auth/popup-blocked': failure('unknown', 'Tu navegador bloqueó la ventana de Google. Habilitá los popups e intentá de nuevo.'),
  'auth/unauthorized-domain': failure('unknown', 'Este dominio no está autorizado para iniciar sesión.'),
  'auth/popup-closed-by-user': failure('cancelled', 'Cancelaste el acceso con Google. Podés intentarlo de nuevo cuando quieras.'),
  'auth/cancelled-popup-request': failure('cancelled', 'Cancelaste el acceso con Google. Podés intentarlo de nuevo cuando quieras.'),
}

const UNKNOWN = failure('unknown', 'No pudimos completar la acción. Intentá de nuevo en unos minutos.')

/** Traduce un error del SDK a un mensaje en español, sin exponer detalles internos ni datos del usuario. */
export function toAuthFailure(error: unknown, action: AuthAction | 'sign-out'): AuthFailure {
  const code = errorCode(error)
  if (CREDENTIAL_CODES.has(code)) return failure('invalid-credentials', GENERIC_SIGN_IN)
  if (code === 'auth/email-already-in-use' || code === 'auth/account-exists-with-different-credential') {
    return failure('invalid-credentials', action === 'google' ? GENERIC_SIGN_IN : GENERIC_SIGN_UP)
  }
  return COMMON[code] ?? UNKNOWN
}

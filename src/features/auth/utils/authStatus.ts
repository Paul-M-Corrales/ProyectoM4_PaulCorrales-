import type { AuthResult, FormStatus } from '../types'

export const FALLBACK_ERROR = 'No pudimos completar la acción. Intentá de nuevo.'
const DEFAULT_SUCCESS = 'Listo. Te estamos llevando a tu cuenta…'

/** Traduce el resultado del gateway al estado que muestra el formulario. */
export function resultToStatus(result: AuthResult): FormStatus {
  if (result.ok) return { kind: 'success', message: result.message ?? DEFAULT_SUCCESS }
  const soft = result.code === 'not-configured' || result.code === 'cancelled'
  return { kind: soft ? 'notice' : 'error', message: result.message }
}

const PUBLIC_ONLY_PATHS = ['/', '/registro', '/recuperar-password']

/** Evita redirecciones a otro origen o de vuelta a una pantalla pública: solo rutas internas privadas. */
export function safeRedirectPath(candidate: unknown, fallback = '/inicio'): string {
  if (typeof candidate !== 'string') return fallback
  const internal = candidate.startsWith('/') && !candidate.startsWith('//') && !candidate.includes('\\')
  return internal && !PUBLIC_ONLY_PATHS.includes(candidate) ? candidate : fallback
}

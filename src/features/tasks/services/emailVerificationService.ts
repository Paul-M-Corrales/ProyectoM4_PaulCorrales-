import { sendEmailVerification } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { readFirebaseConfig } from '@/lib/firebase/config'

export type VerificationSend = { readonly ok: true } | { readonly ok: false; readonly message: string }
export type VerificationRefresh =
  | { readonly ok: true; readonly verified: boolean }
  | { readonly ok: false; readonly message: string }

/**
 * Verificación del correo con Firebase Authentication (no con AWS SES: SES solo envía los resúmenes).
 * Frontera del navegador: la UI nunca toca el SDK ni los tokens.
 */
export interface EmailVerificationService {
  /** true / false según la sesión actual; null si no hay sesión o Firebase no está configurado. */
  isVerified(): boolean | null
  /** Pide a Firebase que envíe el correo de verificación al usuario actual. */
  send(): Promise<VerificationSend>
  /** Recarga al usuario y, si ya verificó, renueva el ID token: el backend lee email_verified del token. */
  refresh(): Promise<VerificationRefresh>
}

const NO_SESSION = 'Tu sesión no es válida. Volvé a iniciar sesión.'
const GENERIC = 'No pudimos completar la operación. Intentá de nuevo más tarde.'

const MESSAGES: Readonly<Record<string, string>> = {
  'auth/too-many-requests': 'Pediste demasiados correos de verificación. Esperá unos minutos antes de intentarlo de nuevo.',
  'auth/network-request-failed': 'No hay conexión. Revisá tu red e intentá de nuevo.',
  'auth/requires-recent-login': NO_SESSION,
  'auth/user-token-expired': NO_SESSION,
}

const messageOf = (error: unknown) => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null
  return (typeof code === 'string' && MESSAGES[code]) || GENERIC
}

type Env = Readonly<Record<string, unknown>>

export function createEmailVerificationService(env: Env = import.meta.env): EmailVerificationService {
  const config = readFirebaseConfig(env)
  const user = () => (config.ok ? getFirebaseAuth(config.config).currentUser : null)
  return {
    isVerified: () => user()?.emailVerified ?? null,
    async send() {
      const current = user()
      if (!current) return { ok: false, message: NO_SESSION }
      try {
        await sendEmailVerification(current)
        return { ok: true }
      } catch (error) {
        return { ok: false, message: messageOf(error) }
      }
    },
    async refresh() {
      const current = user()
      if (!current) return { ok: false, message: NO_SESSION }
      try {
        await current.reload()
        if (current.emailVerified) await current.getIdToken(true)
        return { ok: true, verified: current.emailVerified }
      } catch (error) {
        return { ok: false, message: messageOf(error) }
      }
    },
  }
}

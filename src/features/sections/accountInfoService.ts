import { getFirebaseAuth } from '@/lib/firebase/client'
import { readFirebaseConfig } from '@/lib/firebase/config'

export type AuthProviderKind = 'google' | 'password' | 'other'

/** Lectura (sin escritura) de datos de la sesión de Firebase que la sesión de la app no expone. */
export interface AccountInfo {
  /** null si no hay sesión o Firebase no está configurado: nunca se inventa. */
  readonly emailVerified: boolean | null
  readonly provider: AuthProviderKind | null
}

export type AccountInfoReader = () => AccountInfo

const NONE: AccountInfo = { emailVerified: null, provider: null }

export function providerKind(providerId: string | undefined): AuthProviderKind | null {
  if (providerId === undefined) return null
  if (providerId === 'google.com') return 'google'
  return providerId === 'password' ? 'password' : 'other'
}

export function createAccountInfoReader(env: Readonly<Record<string, unknown>> = import.meta.env): AccountInfoReader {
  const config = readFirebaseConfig(env)
  return () => {
    const user = config.ok ? getFirebaseAuth(config.config).currentUser : null
    if (!user) return NONE
    return { emailVerified: user.emailVerified, provider: providerKind(user.providerData[0]?.providerId) }
  }
}

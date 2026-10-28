import { getFirebaseAuth } from '@/lib/firebase/client'
import { readFirebaseConfig } from '@/lib/firebase/config'
import type { AuthGateway } from '../types'
import { createFirebaseAuthGateway } from './firebaseAuthGateway'
import { unconfiguredAuthGateway } from './unconfiguredAuthGateway'

type Env = Readonly<Record<string, unknown>>

/** Elige el gateway según la configuración disponible; sin ella, la app sigue funcionando y avisa. */
export function createAuthGateway(env: Env = import.meta.env): AuthGateway {
  const result = readFirebaseConfig(env)
  if (!result.ok) {
    console.warn(`[auth] Firebase sin configurar. Faltan: ${result.missing.join(', ')}`)
    return unconfiguredAuthGateway
  }
  return createFirebaseAuthGateway(getFirebaseAuth(result.config))
}

import { useAuth } from '@/features/auth/hooks/useAuth'

export interface Account {
  readonly name: string
  readonly email: string | null
  readonly initials: string
}

/** Datos visibles de la cuenta autenticada (nunca inventa un usuario). */
export function useAccount(): Account {
  const { session } = useAuth()
  const user = session.status === 'authenticated' ? session.user : null
  const name = user?.displayName ?? user?.email ?? 'Mi cuenta'
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return { name, email: user?.email ?? null, initials: initials || '?' }
}

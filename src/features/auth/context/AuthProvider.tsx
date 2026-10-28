import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthGateway, SessionState } from '../types'
import { AuthContext } from './authContext'

interface Props {
  readonly gateway: AuthGateway
  readonly children: ReactNode
}

/** Única fuente de verdad de la sesión: el observer del proveedor, sin sesiones paralelas. */
export function AuthProvider({ gateway, children }: Props) {
  const [session, setSession] = useState<SessionState>({ status: 'loading' })

  useEffect(() => {
    return gateway.onAuthChange(
      (user) => setSession(user ? { status: 'authenticated', user } : { status: 'unauthenticated' }),
      () => setSession({ status: 'unauthenticated' }),
    )
  }, [gateway])

  const value = useMemo(() => ({ session, gateway }), [session, gateway])
  return <AuthContext value={value}>{children}</AuthContext>
}

import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { safeRedirectPath } from '@/features/auth/utils/authStatus'
import { SessionLoading } from './SessionLoading'

/**
 * Protección inversa: quien ya tiene sesión no ve login/registro/recuperación.
 * Mientras la sesión se restaura no se monta el login, para no disparar la intro en vano.
 */
export function PublicOnlyRoute() {
  const { session } = useAuth()
  const location = useLocation()

  if (session.status === 'loading') return <SessionLoading />
  if (session.status === 'authenticated') {
    const from = (location.state as { from?: unknown } | null)?.from
    return <Navigate to={safeRedirectPath(from)} replace />
  }
  return <Outlet />
}

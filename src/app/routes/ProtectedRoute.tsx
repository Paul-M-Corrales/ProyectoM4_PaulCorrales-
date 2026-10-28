import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SessionLoading } from './SessionLoading'

/** Ruta privada: sin sesión vuelve al login recordando a dónde quería ir el usuario. */
export function ProtectedRoute() {
  const { session } = useAuth()
  const location = useLocation()

  if (session.status === 'loading') return <SessionLoading />
  if (session.status === 'unauthenticated') {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

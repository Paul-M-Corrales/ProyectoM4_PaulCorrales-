import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'

// Solo existe en desarrollo: Vite sustituye DEV por false en el build y elimina la ruta y su chunk.
const MascotDevPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/features/mascot/dev/MascotDevPage').then((m) => ({ default: m.MascotDevPage })),
    )
  : null

export function AppRoutes() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar-password" element={<ResetPasswordPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        {MascotDevPage && <Route path="/dev/mascot" element={<MascotDevPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

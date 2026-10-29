import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { ReportsPage } from '@/features/sections/ReportsPage'
import { SettingsPage } from '@/features/sections/SettingsPage'
import { TasksPage } from '@/features/tasks/pages/TasksPage'
import { AppLayout } from './layout/AppLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicOnlyRoute } from './routes/PublicOnlyRoute'

// Solo existen en desarrollo: Vite sustituye DEV por false en el build y elimina las rutas y sus chunks.
const MascotDevPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/features/mascot/dev/MascotDevPage').then((m) => ({ default: m.MascotDevPage })),
    )
  : null
const RideDevPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/features/mascot/dev/RideDevPage').then((m) => ({ default: m.RideDevPage })),
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
          <Route element={<AppLayout />}>
            <Route path="/inicio" element={<HomePage />} />
            <Route path="/tareas" element={<TasksPage />} />
            <Route path="/reportes" element={<ReportsPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
          </Route>
          <Route path="/dashboard" element={<Navigate to="/inicio" replace />} />
        </Route>
        {MascotDevPage && <Route path="/dev/mascot" element={<MascotDevPage />} />}
        {RideDevPage && <Route path="/dev/ride" element={<RideDevPage />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

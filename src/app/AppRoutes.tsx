import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { LoginPage } from '@/features/auth/pages/LoginPage'

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
        <Route path="/" element={<LoginPage />} />
        {MascotDevPage && <Route path="/dev/mascot" element={<MascotDevPage />} />}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Suspense>
  )
}

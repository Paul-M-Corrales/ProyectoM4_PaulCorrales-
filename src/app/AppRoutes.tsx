import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { HomePage } from '@/app/HomePage'

const MascotDevPage = lazy(() =>
  import('@/features/mascot/dev/MascotDevPage').then((m) => ({ default: m.MascotDevPage })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<p role="status">Cargando…</p>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dev/mascot" element={<MascotDevPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Suspense>
  )
}

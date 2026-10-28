import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AppRoutes } from '@/app/AppRoutes'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { createAuthGateway } from '@/features/auth/services/createAuthGateway'
import '@/styles/tokens.css'
import '@/styles/base.css'

const container = document.getElementById('root')
if (!container) throw new Error('No se encontró el elemento #root')

// Se crea una sola vez, fuera del render: la inicialización de Firebase no se repite.
const gateway = createAuthGateway()

createRoot(container).render(
  <StrictMode>
    <AuthProvider gateway={gateway}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

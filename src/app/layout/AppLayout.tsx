import { Outlet } from 'react-router'
import { EmailGateProvider } from '@/features/tasks/components/EmailGateProvider'
import { VerificationBanner } from '@/features/tasks/components/VerificationBanner'
import { Navbar } from './Navbar'
import styles from './app-layout.module.css'

/** Estructura común de las pantallas privadas: barra superior y contenido sobre fondo claro. */
export function AppLayout() {
  return (
    <EmailGateProvider>
      <div className={`ds-app ${styles.shell}`}>
        <Navbar />
        <main className={styles.content}>
          {/* Visible en cualquier pantalla privada, también justo después de registrarse. */}
          <VerificationBanner />
          <Outlet />
        </main>
      </div>
    </EmailGateProvider>
  )
}

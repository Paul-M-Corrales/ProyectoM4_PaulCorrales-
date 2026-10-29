import { Outlet } from 'react-router'
import { Navbar } from './Navbar'
import styles from './app-layout.module.css'

/** Estructura común de las pantallas privadas: barra superior y contenido sobre fondo claro. */
export function AppLayout() {
  return (
    <div className={`ds-app ${styles.shell}`}>
      <Navbar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}

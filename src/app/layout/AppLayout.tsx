import { Outlet } from 'react-router'
import { AppBackdrop } from './AppBackdrop'
import { Navbar } from './Navbar'
import styles from './app-layout.module.css'

/** Estructura común de las pantallas privadas: fondo, barra superior y contenido. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <AppBackdrop />
      <Navbar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}

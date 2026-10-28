import { FuchsiaBackdrop } from '@/features/intro/components/FuchsiaBackdrop'
import styles from './session-loading.module.css'

/** Se muestra mientras se restaura la sesión; evita redirigir antes de conocer el estado. */
export function SessionLoading() {
  return (
    <main className={styles.page}>
      <FuchsiaBackdrop />
      <p role="status" className={styles.text}>
        Verificando tu sesión…
      </p>
    </main>
  )
}

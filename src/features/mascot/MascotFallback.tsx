import type { MascotStatus } from './contracts'
import styles from './Mascot.module.css'

type FallbackStatus = Exclude<MascotStatus, 'ready'>

const MESSAGES: Record<FallbackStatus, string> = {
  loading: 'Cargando a la mascota…',
  error: 'No pudimos cargar la mascota 3D.',
  unsupported: 'Tu navegador no soporta WebGL: la mascota 3D no está disponible.',
}

interface Props {
  readonly status: FallbackStatus
  readonly label: string
}

export function MascotFallback({ status, label }: Props) {
  const role = status === 'loading' ? 'status' : 'alert'
  return (
    <div className={styles.fallback} role={role} data-status={status}>
      <span className={styles.badge} aria-hidden="true">
        {status === 'loading' ? '◔' : '🐰'}
      </span>
      <p>{MESSAGES[status]}</p>
      <p className={styles.sr}>{label}</p>
    </div>
  )
}

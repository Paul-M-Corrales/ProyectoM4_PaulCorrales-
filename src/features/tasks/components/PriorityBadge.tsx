import type { Priority } from '../types'
import styles from './priority-badge.module.css'

const LABELS: Record<Priority, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' }

export function PriorityBadge({ priority }: { readonly priority: Priority }) {
  return (
    <span className={`${styles.badge} ${styles[priority]}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.sr}>Prioridad </span>
      {LABELS[priority]}
    </span>
  )
}

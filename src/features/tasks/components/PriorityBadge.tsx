import type { Priority } from '../types'
import styles from './task-card.module.css'

const LABELS: Record<Priority, string> = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja' }

export function PriorityBadge({ priority }: { readonly priority: Priority }) {
  return (
    <span className={`${styles.badge} ${styles[priority]}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.badgeText}>{LABELS[priority]}</span>
    </span>
  )
}

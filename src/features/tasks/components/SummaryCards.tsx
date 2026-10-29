import { Icon, type IconName } from '@/components/ui/Icon'
import type { TaskCounts } from '../logic/taskFilters'
import styles from './summary-cards.module.css'

export function SummaryCards({ counts }: { readonly counts: TaskCounts }) {
  const cards: readonly { tone: string; icon: IconName; value: number; label: string }[] = [
    { tone: 'green', icon: 'clipboard', value: counts.total, label: 'Total de tareas' },
    { tone: 'yellow', icon: 'clock', value: counts.pending, label: 'Pendientes' },
    { tone: 'violet', icon: 'check', value: counts.completed, label: 'Completadas' },
  ]
  return (
    <ul className={styles.list} aria-label="Resumen de tareas">
      {cards.map((card) => (
        <li key={card.label} className={`${styles.card} ${styles[card.tone]}`}>
          <span className={styles.icon}><Icon name={card.icon} size={22} /></span>
          <span className={styles.text}>
            <strong>{card.value}</strong>
            <small>{card.label}</small>
          </span>
          <span className={styles.dashes} aria-hidden="true" />
        </li>
      ))}
    </ul>
  )
}

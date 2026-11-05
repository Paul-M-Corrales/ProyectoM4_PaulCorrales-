import { Icon, type IconName } from '@/components/ui/Icon'
import type { Metrics } from '../logic/metrics'
import styles from './reports.module.css'

/** Las cinco cifras principales. «Vencidas» y «Pendientes» son conjuntos distintos: vencida ⊂ pendiente. */
export function KpiCards({ metrics }: { readonly metrics: Metrics }) {
  const cards: readonly { tone: string; icon: IconName; value: string; label: string; note?: string }[] = [
    { tone: 'green', icon: 'clipboard', value: String(metrics.total), label: 'Total de tareas' },
    { tone: 'violet', icon: 'check', value: String(metrics.completed), label: 'Completadas' },
    { tone: 'yellow', icon: 'clock', value: String(metrics.pending), label: 'Pendientes' },
    { tone: 'pink', icon: 'flame', value: String(metrics.overdue), label: 'Vencidas', note: 'pendientes con fecha pasada' },
    { tone: 'blue', icon: 'bars', value: `${metrics.percent}%`, label: 'Completado' },
  ]
  return (
    <ul className={styles.kpis} aria-label="Indicadores principales">
      {cards.map((card) => (
        <li key={card.label} className={`${styles.kpi} ${styles[card.tone]}`}>
          <span className={styles.kpiIcon}><Icon name={card.icon} size={20} /></span>
          <strong>{card.value}</strong>
          <span>{card.label}</span>
          {card.note && <small>{card.note}</small>}
        </li>
      ))}
    </ul>
  )
}

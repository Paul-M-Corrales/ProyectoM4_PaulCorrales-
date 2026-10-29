import { RideMascot, type TaskProgress } from '@/features/mascot'
import { KeepGoingCard, QuoteCard, RingCard, StreakCard, WeeklyCard } from './PanelCards'
import styles from './ride-panel.module.css'

/** Columna del 30 %: conejo en bicicleta rodeado de métricas honestas (sin datos inventados). */
export function RidePanel({ progress }: { readonly progress: TaskProgress }) {
  return (
    <aside className={styles.panel} aria-label="Tu avance">
      <div className={styles.keep}><KeepGoingCard progress={progress} /></div>
      <div className={styles.ring}><RingCard progress={progress} /></div>
      <div className={styles.mascot}>
        <RideMascot progress={progress} className={styles.canvas ?? ''} />
      </div>
      <div className={styles.weekly}><WeeklyCard /></div>
      <div className={styles.streak}><StreakCard /></div>
      <div className={styles.quote}><QuoteCard /></div>
    </aside>
  )
}

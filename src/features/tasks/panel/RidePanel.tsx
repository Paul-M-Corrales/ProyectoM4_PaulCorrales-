import { RideMascot, type TaskProgress } from '@/features/mascot'
import { KeepGoingCard, QuoteCard, RingCard, StreakCard, WeeklyCard } from './PanelCards'
import styles from './ride-panel.module.css'

/** Columna del 30 %: conejo en bicicleta rodeado de métricas honestas (sin datos inventados). */
interface Props {
  readonly progress: TaskProgress
  /** true cuando los datos reales ya llegaron (evita celebrar al cargar). */
  readonly ready: boolean
  /** uid del usuario: al cambiar se reinicia la animación transitoria. */
  readonly resetKey: string | null
}

export function RidePanel({ progress, ready, resetKey }: Props) {
  return (
    <aside className={styles.panel} aria-label="Tu avance">
      <div className={styles.keep}><KeepGoingCard progress={progress} /></div>
      <div className={styles.ring}><RingCard progress={progress} /></div>
      <div className={styles.mascot}>
        <RideMascot progress={progress} ready={ready} resetKey={resetKey} className={styles.canvas ?? ''} />
      </div>
      <div className={styles.weekly}><WeeklyCard /></div>
      <div className={styles.streak}><StreakCard /></div>
      <div className={styles.quote}><QuoteCard /></div>
    </aside>
  )
}

import { RideMascot, type TaskProgress } from '@/features/mascot'
import { ProgressCard } from './ProgressCard'
import styles from './ride-stage.module.css'

/** Columna del 30 %: conejo en su bicicleta fija y progreso real de tareas. */
export function RideStage({ progress }: { readonly progress: TaskProgress }) {
  return (
    <aside className={styles.stage} aria-label="Tu avance">
      <div className={styles.glow} aria-hidden="true" />
      <RideMascot progress={progress} className={styles.mascot} />
      <ProgressCard progress={progress} />
    </aside>
  )
}

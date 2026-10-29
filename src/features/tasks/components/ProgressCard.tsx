import { progressRatio, type TaskProgress } from '@/features/mascot'
import styles from './progress-card.module.css'

function summary({ total, completed }: TaskProgress): string {
  if (total === 0) return 'Cuando agregues tareas, tu avance aparecerá acá.'
  if (completed >= total) return '¡Completaste todo! Merecés una celebración.'
  return 'Cada tarea completada acelera el pedaleo.'
}

export function ProgressCard({ progress }: { readonly progress: TaskProgress }) {
  const percent = Math.round(progressRatio(progress) * 100)
  return (
    <section className={styles.card} aria-labelledby="progress-title">
      <h2 id="progress-title" className={styles.title}>Tu progreso</h2>
      <p className={styles.count}>
        <strong>{progress.completed}</strong> de <strong>{progress.total}</strong> tareas completadas
      </p>
      <div
        className={styles.track}
        role="progressbar"
        aria-labelledby="progress-title"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
      <p className={styles.hint}>{summary(progress)}</p>
    </section>
  )
}

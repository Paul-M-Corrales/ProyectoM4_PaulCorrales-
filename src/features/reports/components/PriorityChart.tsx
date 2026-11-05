import type { Metrics } from '../logic/metrics'
import styles from './reports.module.css'

const LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' } as const

/** Barras horizontales proporcionales al total; cada fila repite las cifras en texto (no depende del color). */
export function PriorityChart({ metrics }: { readonly metrics: Metrics }) {
  return (
    <section className={styles.panel} aria-labelledby="priority-title">
      <h2 id="priority-title">Distribución por prioridad</h2>
      <ul className={styles.bars}>
        {metrics.byPriority.map((stat) => {
          const width = metrics.total === 0 ? 0 : (stat.total / metrics.total) * 100
          return (
            <li key={stat.priority}>
              <div className={styles.barHead}>
                <span>{LABELS[stat.priority]}</span>
                <span>
                  {stat.total} {stat.total === 1 ? 'tarea' : 'tareas'} · {stat.pending} pend. · {stat.completed} compl.
                </span>
              </div>
              <div
                className={styles.barTrack}
                role="img"
                aria-label={`Prioridad ${LABELS[stat.priority].toLowerCase()}: ${stat.total} de ${metrics.total} tareas`}
              >
                <span className={`${styles.barFill} ${styles[stat.priority]}`} style={{ width: `${width}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

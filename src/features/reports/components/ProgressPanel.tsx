import type { Metrics } from '../logic/metrics'
import styles from './reports.module.css'

/** Barra de progreso general: el porcentaje y el texto equivalente van siempre visibles. */
export function ProgressPanel({ metrics }: { readonly metrics: Metrics }) {
  return (
    <section className={styles.panel} aria-labelledby="progress-title">
      <h2 id="progress-title">Progreso general</h2>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Porcentaje de tareas completadas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={metrics.percent}
        aria-valuetext={`${metrics.percent}% completado`}
      >
        <span className={styles.fill} style={{ width: `${metrics.percent}%` }} />
      </div>
      <p className={styles.caption}>
        {metrics.completed} de {metrics.total} tareas completadas ({metrics.percent}%).
      </p>
    </section>
  )
}

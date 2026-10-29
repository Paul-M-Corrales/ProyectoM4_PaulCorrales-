import styles from './shapes.module.css'

/** Formas gráficas abstractas de fondo. Puramente decorativas. */
export function Shapes() {
  return (
    <div className={styles.shapes} aria-hidden="true">
      <span className={`${styles.block} ${styles.yellow}`} />
      <span className={`${styles.block} ${styles.green}`} />
      <span className={`${styles.block} ${styles.blue}`} />
      <span className={`${styles.block} ${styles.coral}`} />
      <span className={`${styles.block} ${styles.orange}`} />
      <svg className={styles.squiggle} viewBox="0 0 220 90" fill="none">
        <path d="M6 70c40-16 54-52 70-46s-8 40 22 30 40-30 54-22 6 30 40 12" stroke="#b36bff" strokeWidth="11" strokeLinecap="round" />
      </svg>
      <svg className={styles.asterisk} viewBox="0 0 48 48" fill="#0c0c10">
        <path d="M21 2h6v15l13-8 3 5-13 8 13 8-3 5-13-8v15h-6V27L8 35l-3-5 13-8-13-8 3-5 13 8V2Z" />
      </svg>
      <svg className={styles.scribble} viewBox="0 0 60 80" fill="none">
        <path d="M30 40C8 30 14 6 32 8s14 28-4 34c-24 10-26 36-6 30s24-30 6-38" stroke="#0c0c10" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <span className={`${styles.dash} ${styles.dashGreen}`} />
      <span className={`${styles.dash} ${styles.dashYellow}`} />
    </div>
  )
}

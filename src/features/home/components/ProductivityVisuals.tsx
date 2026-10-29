import styles from './productivity-visuals.module.css'

/** Adornos de productividad alrededor de la mascota. Ilustrativos: no muestran datos del usuario. */
export function ProductivityVisuals() {
  return (
    <div className={styles.visuals} aria-hidden="true">
      <div className={styles.ring} />
      <div className={`${styles.chip} ${styles.chipTop}`}>
        <span className={styles.tick}>✓</span> Tareas al día
      </div>
      <div className={`${styles.chip} ${styles.chipMid}`}>
        <span className={styles.flag} /> Prioridades
      </div>
      <div className={`${styles.chip} ${styles.chipBottom}`}>
        <span className={styles.meter}><span /></span> Progreso
      </div>
    </div>
  )
}

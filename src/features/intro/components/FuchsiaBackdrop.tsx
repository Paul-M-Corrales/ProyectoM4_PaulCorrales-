import styles from './backdrop.module.css'

/** Fondo fucsia con capas a distintas velocidades para dar profundidad. Solo decorativo. */
export function FuchsiaBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={`${styles.blob} ${styles.blobPink}`} />
      <div className={`${styles.blob} ${styles.blobViolet}`} />
      <div className={`${styles.blob} ${styles.blobHot}`} />
      <div className={styles.streaks} />
      <div className={styles.grid} />
      <div className={styles.rings} />
      <div className={styles.vignette} />
    </div>
  )
}

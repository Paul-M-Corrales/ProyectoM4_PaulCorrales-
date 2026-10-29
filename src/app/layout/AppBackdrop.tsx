import styles from './app-backdrop.module.css'

/** Fondo negro azulado con resplandores fucsia y violeta, común a las pantallas privadas. */
export function AppBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={`${styles.glow} ${styles.fuchsia}`} />
      <div className={`${styles.glow} ${styles.violet}`} />
      <div className={`${styles.glow} ${styles.blue}`} />
      <div className={styles.grid} />
    </div>
  )
}

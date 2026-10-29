import styles from './eyebrow.module.css'

/** Etiqueta superior con punto verde ("TU DÍA, EN MOVIMIENTO"). */
export function Eyebrow({ children }: { readonly children: string }) {
  return (
    <p className={styles.eyebrow}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </p>
  )
}

import styles from './tasks-empty.module.css'

interface Props {
  /** "none": no hay tareas; "no-results": hay tareas pero la búsqueda o el filtro no coinciden. */
  readonly variant: 'none' | 'no-results'
  readonly connected: boolean
  readonly onCreate: () => void
}

export function TasksEmpty({ variant, connected, onCreate }: Props) {
  if (variant === 'no-results') {
    return (
      <div className={styles.empty}>
        <h3>Sin resultados</h3>
        <p>Ninguna tarea coincide con tu búsqueda o filtro.</p>
      </div>
    )
  }
  return (
    <div className={styles.empty}>
      <span className={styles.icon} aria-hidden="true">✓</span>
      <h3>Todavía no tenés tareas</h3>
      <p>Creá la primera para empezar a pedalear hacia tus objetivos.</p>
      {!connected && (
        <p className={styles.note} role="note">
          El guardado de tareas se conecta en el próximo paso del proyecto.
        </p>
      )}
      <button type="button" className={styles.cta} onClick={onCreate}>
        Crear mi primera tarea
      </button>
    </div>
  )
}

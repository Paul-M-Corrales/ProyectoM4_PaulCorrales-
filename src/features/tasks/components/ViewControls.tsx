import { SORT_KEYS, SORT_LABELS, type SortKey } from '../logic/sortTasks'
import styles from './view-controls.module.css'

interface Props {
  readonly sort: SortKey
  readonly onSortChange: (sort: SortKey) => void
}

/** Orden (funcional) y vista (solo Lista por ahora; el tablero se habilitará con Firestore). */
export function ViewControls({ sort, onSortChange }: Props) {
  return (
    <div className={styles.controls}>
      <label className={styles.select}>
        <span>Ordenar por:</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value as SortKey)}>
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>{SORT_LABELS[key]}</option>
          ))}
        </select>
      </label>
      <label className={styles.select}>
        <span>Vista:</span>
        <select defaultValue="list">
          <option value="list">Lista</option>
          <option value="board" disabled>Tablero (próximamente)</option>
        </select>
      </label>
    </div>
  )
}

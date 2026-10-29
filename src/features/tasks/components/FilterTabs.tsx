import { FILTERS, type TaskFilter } from '../types'
import styles from './tasks-toolbar.module.css'

const LABELS: Record<TaskFilter, string> = { all: 'Todas', pending: 'Pendientes', completed: 'Completadas' }

interface Props {
  readonly value: TaskFilter
  readonly onChange: (filter: TaskFilter) => void
}

export function FilterTabs({ value, onChange }: Props) {
  return (
    <div className={styles.tabs} role="group" aria-label="Filtrar tareas">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          className={styles.tab}
          aria-pressed={value === filter}
          onClick={() => onChange(filter)}
        >
          {LABELS[filter]}
        </button>
      ))}
    </div>
  )
}

import { FILTERS, type TaskFilter } from '../types'
import type { TaskCounts } from '../logic/taskFilters'
import styles from './filter-tabs.module.css'

const LABELS: Record<TaskFilter, string> = { all: 'Todas', pending: 'Pendientes', completed: 'Completadas' }

interface Props {
  readonly value: TaskFilter
  readonly counts: TaskCounts
  readonly onChange: (filter: TaskFilter) => void
}

export function FilterTabs({ value, counts, onChange }: Props) {
  const count: Record<TaskFilter, number> = {
    all: counts.total,
    pending: counts.pending,
    completed: counts.completed,
  }
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
          <span className={styles.count} aria-label={`${count[filter]} tareas`}>{count[filter]}</span>
        </button>
      ))}
    </div>
  )
}

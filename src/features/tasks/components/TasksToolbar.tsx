import type { TaskFilter } from '../types'
import { FilterTabs } from './FilterTabs'
import styles from './tasks-toolbar.module.css'

interface Props {
  readonly query: string
  readonly filter: TaskFilter
  readonly newTaskOpen: boolean
  readonly onQueryChange: (query: string) => void
  readonly onFilterChange: (filter: TaskFilter) => void
  readonly onNewTask: () => void
}

export function TasksToolbar({ query, filter, newTaskOpen, onQueryChange, onFilterChange, onNewTask }: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.top}>
        <label className={styles.search}>
          <span className={styles.sr}>Buscar tareas</span>
          <input
            type="search"
            value={query}
            placeholder="Buscar tareas…"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <button
          type="button"
          className={styles.new}
          aria-expanded={newTaskOpen}
          aria-controls="new-task-panel"
          onClick={onNewTask}
        >
          + Nueva tarea
        </button>
      </div>
      <FilterTabs value={filter} onChange={onFilterChange} />
    </div>
  )
}

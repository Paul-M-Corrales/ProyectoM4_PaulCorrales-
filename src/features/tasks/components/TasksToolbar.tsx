import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import styles from './tasks-toolbar.module.css'

interface Props {
  readonly query: string
  readonly newTaskOpen: boolean
  readonly onQueryChange: (query: string) => void
  readonly onNewTask: () => void
}

export function TasksToolbar({ query, newTaskOpen, onQueryChange, onNewTask }: Props) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.search}>
        <span className={styles.sr}>Buscar tareas</span>
        <Icon name="search" size={20} />
        <input
          type="search"
          value={query}
          placeholder="Buscar tareas, proyectos o etiquetas…"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <Button
        icon="plus"
        aria-expanded={newTaskOpen}
        aria-controls="new-task-panel"
        onClick={onNewTask}
      >
        Nueva tarea
      </Button>
    </div>
  )
}

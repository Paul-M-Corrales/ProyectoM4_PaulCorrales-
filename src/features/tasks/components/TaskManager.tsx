import { useState } from 'react'
import type { useTaskView } from '../hooks/useTaskView'
import type { Task, TaskActionResult, TaskDraft } from '../types'
import { TaskForm } from './TaskForm'
import { TaskList } from './TaskList'
import { TasksEmpty } from './TasksEmpty'
import { TasksToolbar } from './TasksToolbar'
import styles from './task-manager.module.css'

interface Actions {
  readonly create: (draft: TaskDraft) => Promise<TaskActionResult>
  readonly update: (id: string, changes: { completed: boolean }) => Promise<TaskActionResult>
  readonly remove: (id: string) => Promise<TaskActionResult>
}

interface Props {
  readonly view: ReturnType<typeof useTaskView>
  readonly total: number
  readonly connected: boolean
  readonly actions: Actions
}

/** Columna del 70 %: buscador, filtros, alta de tareas y listado. */
export function TaskManager({ view, total, connected, actions }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const run = async (action: Promise<TaskActionResult>) => {
    const result = await action
    setError(result.ok ? undefined : result.message)
  }
  const toggle = (task: Task) => void run(actions.update(task.id, { completed: !task.completed }))
  const remove = (task: Task) => void run(actions.remove(task.id))

  return (
    <section className={styles.manager} aria-labelledby="tasks-title">
      <h1 id="tasks-title" className={styles.title}>Mis tareas</h1>
      <TasksToolbar
        query={view.query}
        filter={view.filter}
        newTaskOpen={formOpen}
        onQueryChange={view.setQuery}
        onFilterChange={view.setFilter}
        onNewTask={() => setFormOpen((open) => !open)}
      />
      <div id="new-task-panel" hidden={!formOpen}>
        {formOpen && <TaskForm onSubmit={actions.create} onCancel={() => setFormOpen(false)} />}
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {view.visible.length > 0 ? (
        <TaskList tasks={view.visible} onToggle={toggle} onDelete={remove} />
      ) : (
        <TasksEmpty
          variant={total === 0 ? 'none' : 'no-results'}
          connected={connected}
          onCreate={() => setFormOpen(true)}
        />
      )}
    </section>
  )
}

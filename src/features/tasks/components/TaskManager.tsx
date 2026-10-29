import { useState } from 'react'
import type { TaskView } from '../hooks/useTaskView'
import type { Task, TaskActionResult, TaskDraft } from '../types'
import { FilterTabs } from './FilterTabs'
import { SummaryCards } from './SummaryCards'
import { TaskForm } from './TaskForm'
import { TaskGroups } from './TaskGroups'
import { TasksEmpty } from './TasksEmpty'
import { TasksHeader } from './TasksHeader'
import { TasksToolbar } from './TasksToolbar'
import { ViewControls } from './ViewControls'
import styles from './task-manager.module.css'

interface Actions {
  readonly create: (draft: TaskDraft) => Promise<TaskActionResult>
  readonly update: (id: string, changes: Partial<TaskDraft & { completed: boolean }>) => Promise<TaskActionResult>
  readonly remove: (id: string) => Promise<TaskActionResult>
}

interface Props {
  readonly view: TaskView
  readonly connected: boolean
  readonly actions: Actions
  readonly startOpen?: boolean
}

/** Columna del 70 %: encabezado, buscador, filtros, resumen y listado agrupado. */
export function TaskManager({ view, connected, actions, startOpen = false }: Props) {
  const [formOpen, setFormOpen] = useState(startOpen)
  const [editing, setEditing] = useState<Task | undefined>()
  const [error, setError] = useState<string | undefined>()

  const run = async (action: Promise<TaskActionResult>) => {
    const result = await action
    setError(result.ok ? undefined : result.message)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditing(undefined)
  }
  const submit = (draft: TaskDraft) => (editing ? actions.update(editing.id, draft) : actions.create(draft))

  return (
    <section className={styles.manager} aria-labelledby="tasks-title">
      <TasksHeader />
      <TasksToolbar
        query={view.query}
        newTaskOpen={formOpen}
        onQueryChange={view.setQuery}
        onNewTask={() => (formOpen ? closeForm() : setFormOpen(true))}
      />
      <div className={styles.filters}>
        <FilterTabs value={view.filter} counts={view.counts} onChange={view.setFilter} />
        <ViewControls sort={view.sort} onSortChange={view.setSort} />
      </div>
      <SummaryCards counts={view.counts} />
      <div id="new-task-panel" hidden={!formOpen}>
        {formOpen && <TaskForm key={editing?.id ?? 'new'} initial={editing} onSubmit={submit} onCancel={closeForm} />}
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {view.groups.length > 0 ? (
        <TaskGroups
          groups={view.groups}
          onToggle={(task) => void run(actions.update(task.id, { completed: !task.completed }))}
          onEdit={(task) => {
            setEditing(task)
            setFormOpen(true)
          }}
          onDelete={(task) => void run(actions.remove(task.id))}
        />
      ) : (
        <TasksEmpty
          variant={view.counts.total === 0 ? 'none' : 'no-results'}
          connected={connected}
          onCreate={() => setFormOpen(true)}
        />
      )}
    </section>
  )
}

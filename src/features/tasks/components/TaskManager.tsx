import { useState } from 'react'
import type { TaskView } from '../hooks/useTaskView'
import type { TasksStatus } from '../hooks/useTasks'
import { useTaskFeedback } from '../hooks/useTaskFeedback'
import type { Task, TaskActionResult, TaskChanges, TaskDraft } from '../types'
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
  readonly update: (id: string, changes: TaskChanges) => Promise<TaskActionResult>
  readonly remove: (id: string) => Promise<TaskActionResult>
}

interface Props {
  readonly view: TaskView
  readonly status: TasksStatus
  readonly loadError?: string | undefined
  readonly connected: boolean
  readonly actions: Actions
  readonly startOpen?: boolean
}

/** Columna del 70 %: encabezado, buscador, filtros, resumen y listado agrupado. */
export function TaskManager({ view, status, loadError, connected, actions, startOpen = false }: Props) {
  const [formOpen, setFormOpen] = useState(startOpen)
  const [editing, setEditing] = useState<Task | undefined>()
  const { feedback, run, clear } = useTaskFeedback()

  const closeForm = () => {
    setFormOpen(false)
    setEditing(undefined)
  }
  const submit = async (draft: TaskDraft) => {
    const result = await (editing ? actions.update(editing.id, draft) : actions.create(draft))
    if (result.ok) clear()
    return result
  }
  const remove = (task: Task) => {
    if (window.confirm(`¿Eliminar «${task.title}»? Esta acción no se puede deshacer.`)) {
      void run(actions.remove(task.id), 'Tarea eliminada.')
    }
  }
  const emptyVariant = status === 'loading' ? 'loading' : view.counts.total === 0 ? 'none' : 'no-results'

  return (
    <section className={styles.manager} aria-labelledby="tasks-title" aria-busy={status === 'loading'}>
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
      {loadError && <p className={styles.error} role="alert">{loadError}</p>}
      {feedback?.kind === 'error' && <p className={styles.error} role="alert">{feedback.message}</p>}
      {feedback?.kind === 'ok' && <p className={styles.notice} role="status">{feedback.message}</p>}
      {view.groups.length > 0 ? (
        <TaskGroups
          groups={view.groups}
          onToggle={(task) => void run(actions.update(task.id, { completed: !task.completed }), 'Cambios guardados.')}
          onEdit={(task) => {
            setEditing(task)
            setFormOpen(true)
          }}
          onDelete={remove}
        />
      ) : (
        <TasksEmpty variant={emptyVariant} connected={connected} onCreate={() => setFormOpen(true)} />
      )}
    </section>
  )
}

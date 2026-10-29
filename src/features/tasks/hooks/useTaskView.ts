import { useMemo, useState } from 'react'
import { filterTasks, progressOf } from '../logic/taskFilters'
import type { Task, TaskFilter } from '../types'

/** Estado de la vista (búsqueda y filtro) y los derivados que dependen de él. */
export function useTaskView(tasks: readonly Task[]) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TaskFilter>('all')

  const visible = useMemo(() => filterTasks(tasks, filter, query), [tasks, filter, query])
  const progress = useMemo(() => progressOf(tasks), [tasks])

  return { query, setQuery, filter, setFilter, visible, progress }
}

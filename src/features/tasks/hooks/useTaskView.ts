import { useMemo, useState } from 'react'
import { groupTasks } from '../logic/groupTasks'
import { sortTasks, type SortKey } from '../logic/sortTasks'
import { countTasks, filterTasks, progressOf } from '../logic/taskFilters'
import type { Task, TaskFilter } from '../types'

/** Estado de la vista (búsqueda, filtro, orden) y los derivados que dependen de él. */
export function useTaskView(tasks: readonly Task[]) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sort, setSort] = useState<SortKey>('due')

  const visible = useMemo(
    () => sortTasks(filterTasks(tasks, filter, query), sort),
    [tasks, filter, query, sort],
  )
  const groups = useMemo(() => groupTasks(visible), [visible])
  const progress = useMemo(() => progressOf(tasks), [tasks])
  const counts = useMemo(() => countTasks(tasks), [tasks])

  return { all: tasks, query, setQuery, filter, setFilter, sort, setSort, visible, groups, progress, counts }
}

export type TaskView = ReturnType<typeof useTaskView>

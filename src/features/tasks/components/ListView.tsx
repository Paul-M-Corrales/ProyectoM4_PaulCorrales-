import type { TaskView } from '../hooks/useTaskView'
import type { Task } from '../types'
import { SortableTaskList } from './SortableTaskList'
import { TaskGroups } from './TaskGroups'

interface Props {
  readonly custom: boolean
  readonly view: TaskView
  readonly onToggle: (task: Task) => void
  readonly onEdit: (task: Task) => void
  readonly onDelete: (task: Task) => void
  readonly onReorder: (activeId: string, overId: string) => void
}

/** Orden Personalizado: lista única arrastrable. Resto de órdenes: grupos por vencimiento. */
export function ListView({ custom, view, onReorder, ...handlers }: Props) {
  return custom ? (
    <SortableTaskList tasks={view.visible} onReorder={onReorder} {...handlers} />
  ) : (
    <TaskGroups groups={view.groups} {...handlers} />
  )
}

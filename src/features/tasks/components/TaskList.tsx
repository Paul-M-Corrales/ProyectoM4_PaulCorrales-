import type { Task } from '../types'
import { TaskCard } from './TaskCard'
import styles from './task-list.module.css'

interface Props {
  readonly tasks: readonly Task[]
  readonly onToggle: (task: Task) => void
  readonly onDelete: (task: Task) => void
}

export function TaskList({ tasks, onToggle, onDelete }: Props) {
  return (
    <ul className={styles.list} aria-label="Lista de tareas">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

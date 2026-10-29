import { formatDueDate, isOverdue } from '../logic/dates'
import type { Task } from '../types'
import { PriorityBadge } from './PriorityBadge'
import styles from './task-card.module.css'

interface Props {
  readonly task: Task
  readonly onToggle: (task: Task) => void
  readonly onDelete: (task: Task) => void
}

export function TaskCard({ task, onToggle, onDelete }: Props) {
  const overdue = task.dueDate !== null && !task.completed && isOverdue(task.dueDate)
  return (
    <li className={`${styles.card} ${task.completed ? styles.done : ''}`}>
      <input
        className={styles.check}
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Marcar «${task.title}» como ${task.completed ? 'pendiente' : 'completada'}`}
      />
      <div className={styles.body}>
        <h3 className={styles.title}>{task.title}</h3>
        {task.description && <p className={styles.description}>{task.description}</p>}
        <div className={styles.meta}>
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <time className={overdue ? styles.overdue : styles.date} dateTime={task.dueDate}>
              {overdue ? 'Venció el ' : 'Para el '}
              {formatDueDate(task.dueDate)}
            </time>
          )}
        </div>
      </div>
      <button type="button" className={styles.remove} onClick={() => onDelete(task)}>
        Eliminar<span className={styles.sr}> «{task.title}»</span>
      </button>
    </li>
  )
}

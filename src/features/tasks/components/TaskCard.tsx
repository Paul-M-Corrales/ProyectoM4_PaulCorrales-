import type { CSSProperties, ReactNode, Ref } from 'react'
import { Icon } from '@/components/ui/Icon'
import { formatDueDate, isOverdue } from '../logic/dates'
import type { Task } from '../types'
import { PriorityBadge } from './PriorityBadge'
import styles from './task-card.module.css'

interface Props {
  readonly task: Task
  readonly onToggle: (task: Task) => void
  readonly onEdit: (task: Task) => void
  readonly onDelete: (task: Task) => void
  /** Presente solo en el orden Personalizado: el <li> pasa a ser un elemento ordenable. */
  readonly sortable?: {
    readonly rootRef: Ref<HTMLLIElement>
    readonly style: CSSProperties
    readonly handle: ReactNode
    readonly dragging: boolean
  }
}

export function TaskCard({ task, onToggle, onEdit, onDelete, sortable }: Props) {
  const overdue = task.dueDate !== null && !task.completed && isOverdue(task.dueDate)
  return (
    <li
      ref={sortable?.rootRef}
      style={sortable?.style}
      className={`${styles.card} ${task.completed ? styles.done : ''} ${sortable?.dragging ? styles.dragging : ''}`}
    >
      {sortable ? sortable.handle : <span
        className={styles.grip}
        role="img"
        aria-label="Para reordenar, elegí «Personalizado» en Ordenar por"
        title="Para reordenar, elegí «Personalizado» en Ordenar por"
      >
        <Icon name="grip" size={18} />
      </span>}
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
      </div>
      <div className={styles.meta}>
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <time className={overdue ? styles.overdue : styles.date} dateTime={task.dueDate}>
            <Icon name="calendar" size={16} />
            {formatDueDate(task.dueDate)}
          </time>
        )}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={() => onEdit(task)}>
          <Icon name="pencil" size={16} />
          <span className={styles.sr}>Editar «{task.title}»</span>
        </button>
        <button type="button" className={styles.action} onClick={() => onDelete(task)}>
          <Icon name="trash" size={16} />
          <span className={styles.sr}>Eliminar «{task.title}»</span>
        </button>
      </div>
    </li>
  )
}

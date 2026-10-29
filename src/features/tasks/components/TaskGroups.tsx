import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { TaskGroup } from '../logic/groupTasks'
import type { Task } from '../types'
import { TaskCard } from './TaskCard'
import styles from './task-groups.module.css'

interface Handlers {
  readonly onToggle: (task: Task) => void
  readonly onEdit: (task: Task) => void
  readonly onDelete: (task: Task) => void
}

function Group({ group, ...handlers }: { readonly group: TaskGroup } & Handlers) {
  const [open, setOpen] = useState(true)
  const listId = `group-${group.key}`
  return (
    <section className={styles.group} aria-labelledby={`${listId}-title`}>
      <button
        type="button"
        className={styles.head}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <h2 id={`${listId}-title`} className={styles.title}>{group.label}</h2>
        <span className={styles.count}>
          {group.tasks.length} {group.tasks.length === 1 ? 'tarea' : 'tareas'}
        </span>
        <Icon name="chevron" size={22} className={open ? styles.open : styles.closed} />
      </button>
      <ul id={listId} className={styles.list} hidden={!open} aria-label={group.label}>
        {group.tasks.map((task) => (
          <TaskCard key={task.id} task={task} {...handlers} />
        ))}
      </ul>
    </section>
  )
}

export function TaskGroups({ groups, ...handlers }: { readonly groups: readonly TaskGroup[] } & Handlers) {
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <Group key={group.key} group={group} {...handlers} />
      ))}
    </div>
  )
}

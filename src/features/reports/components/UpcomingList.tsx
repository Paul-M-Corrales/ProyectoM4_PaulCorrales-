import { formatDueDate } from '@/features/tasks/logic/dates'
import type { Task } from '@/features/tasks/types'
import styles from './reports.module.css'

const LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' } as const

/** Próximos vencimientos de tareas pendientes (hoy o después). */
export function UpcomingList({ tasks }: { readonly tasks: readonly Task[] }) {
  return (
    <section className={styles.panel} aria-labelledby="upcoming-title">
      <h2 id="upcoming-title">Próximos vencimientos</h2>
      {tasks.length === 0 ? (
        <p className={styles.caption}>No hay tareas pendientes con fecha límite próxima.</p>
      ) : (
        <ol className={styles.upcoming}>
          {tasks.map((task) => (
            <li key={task.id}>
              <span className={styles.upTitle}>{task.title}</span>
              <span className={styles.upMeta}>
                {task.dueDate && formatDueDate(task.dueDate)} · Prioridad {LABELS[task.priority].toLowerCase()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

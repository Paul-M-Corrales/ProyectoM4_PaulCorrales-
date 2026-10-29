import { useSearchParams } from 'react-router'
import { TaskManager } from '../components/TaskManager'
import { useTasks } from '../hooks/useTasks'
import { useTaskView } from '../hooks/useTaskView'
import { RidePanel } from '../panel/RidePanel'
import styles from './tasks-page.module.css'

/** Mis tareas: 70 % gestión, 30 % conejo en bici. Los datos llegan por useTasks (Firestore después). */
export function TasksPage() {
  const { tasks, connected, create, update, remove } = useTasks()
  const view = useTaskView(tasks)
  const [params] = useSearchParams()

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <TaskManager
          view={view}
          connected={connected}
          actions={{ create, update, remove }}
          startOpen={params.get('nueva') === '1'}
        />
      </div>
      <RidePanel progress={view.progress} />
    </div>
  )
}

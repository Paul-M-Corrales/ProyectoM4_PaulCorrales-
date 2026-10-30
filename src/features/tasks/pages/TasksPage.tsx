import { useSearchParams } from 'react-router'
import { TaskManager } from '../components/TaskManager'
import { useTaskRepository } from '../hooks/useTaskRepository'
import { useTasks } from '../hooks/useTasks'
import { useTaskView } from '../hooks/useTaskView'
import { RidePanel } from '../panel/RidePanel'
import styles from './tasks-page.module.css'

/** Mis tareas: 70 % gestión, 30 % conejo en bici. Los datos llegan en tiempo real desde Firestore. */
export function TasksPage() {
  const { repository, uid } = useTaskRepository()
  const { tasks, status, loadError, connected, create, update, remove, reorder } = useTasks(repository)
  const view = useTaskView(tasks)
  const [params] = useSearchParams()

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <TaskManager
          view={view}
          status={status}
          loadError={loadError}
          connected={connected}
          actions={{ create, update, remove, reorder }}
          startOpen={params.get('nueva') === '1'}
        />
      </div>
      <RidePanel progress={view.progress} ready={status === 'ready'} resetKey={uid} />
    </div>
  )
}

import { RideStage } from '../components/RideStage'
import { TaskManager } from '../components/TaskManager'
import { useTasks } from '../hooks/useTasks'
import { useTaskView } from '../hooks/useTaskView'
import styles from './tasks-page.module.css'

/** Mis tareas: 70 % gestión, 30 % conejo en bici y progreso. Los datos llegan por useTasks (Firestore después). */
export function TasksPage() {
  const { tasks, connected, create, update, remove } = useTasks()
  const view = useTaskView(tasks)

  return (
    <div className={styles.page}>
      <TaskManager
        view={view}
        total={tasks.length}
        connected={connected}
        actions={{ create, update, remove }}
      />
      <RideStage progress={view.progress} />
    </div>
  )
}

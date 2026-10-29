import { Eyebrow } from '@/components/ui/Eyebrow'
import styles from './tasks-header.module.css'

export function TasksHeader() {
  return (
    <header className={styles.header}>
      <Eyebrow>Tu día, en movimiento</Eyebrow>
      <h1 id="tasks-title" className={styles.title}>Mis tareas</h1>
      <p className={styles.lead}>Organiza, prioriza y avanza en lo que realmente importa.</p>
    </header>
  )
}

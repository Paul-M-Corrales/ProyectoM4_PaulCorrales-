import { useMemo } from 'react'
import { Link } from 'react-router'
import { KpiCards } from '@/features/reports/components/KpiCards'
import { PriorityChart } from '@/features/reports/components/PriorityChart'
import { ProgressPanel } from '@/features/reports/components/ProgressPanel'
import { UpcomingList } from '@/features/reports/components/UpcomingList'
import styles from '@/features/reports/components/reports.module.css'
import { computeMetrics } from '@/features/reports/logic/metrics'
import { useTaskRepository } from '@/features/tasks/hooks/useTaskRepository'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { SectionPage } from './SectionPage'

const LEAD = 'Cifras calculadas en tiempo real a partir de tus tareas, las mismas que ves en Mis tareas.'

/** Reportes: reutiliza el repositorio y la suscripción de Mis tareas; no hay una segunda fuente de datos. */
export function ReportsPage() {
  const { repository } = useTaskRepository()
  const { tasks, status, loadError, connected } = useTasks(repository)
  const metrics = useMemo(() => computeMetrics(tasks), [tasks])

  return (
    <SectionPage title="Reportes" lead={LEAD}>
      {status === 'loading' && <p className={styles.status} role="status">Cargando tus reportes…</p>}
      {status === 'error' && <p className={`${styles.status} ${styles.error}`} role="alert">{loadError}</p>}
      {status === 'ready' && metrics.total === 0 && (
        <div className={styles.status} role="status">
          <p>
            Todavía no tenés tareas, así que no hay nada para reportar.{' '}
            <Link to="/tareas?nueva=1">Creá la primera</Link>.
          </p>
          {!connected && <p>No hay conexión con tus datos: falta configurar Firebase o iniciar sesión.</p>}
        </div>
      )}
      {status === 'ready' && metrics.total > 0 && (
        <>
          <KpiCards metrics={metrics} />
          <div className={styles.layout}>
            <div className={styles.wide}><ProgressPanel metrics={metrics} /></div>
            <PriorityChart metrics={metrics} />
            <UpcomingList tasks={metrics.upcoming} />
          </div>
          <p className={styles.caption}>
            La evolución por semana no está disponible: las tareas no guardan la fecha en que se completaron.
          </p>
        </>
      )}
    </SectionPage>
  )
}

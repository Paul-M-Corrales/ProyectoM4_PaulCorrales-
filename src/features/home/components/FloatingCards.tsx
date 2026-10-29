import { Icon } from '@/components/ui/Icon'
import styles from './floating-cards.module.css'

const TODAY = [
  { label: 'Diseño de propuesta', done: true },
  { label: 'Revisar documentos', done: false },
  { label: 'Planificar la semana', done: false },
] as const

const BARS = [28, 38, 50, 62, 78, 92] as const

/** Tarjetas de producto ilustrativas (no son datos del usuario). */
export function FloatingCards() {
  return (
    <div className={styles.cards} aria-hidden="true">
      <div className={`${styles.card} ${styles.today}`}>
        <h3>Mis tareas de hoy</h3>
        <ul>
          {TODAY.map((task) => (
            <li key={task.label} className={task.done ? styles.done : ''}>
              <span className={styles.box}>{task.done && <Icon name="check" size={13} />}</span>
              {task.label}
            </li>
          ))}
        </ul>
      </div>
      <div className={`${styles.card} ${styles.week}`}>
        <small>Progreso semanal</small>
        <strong>80% <Icon name="arrow" size={14} /></strong>
        <div className={styles.bars}>
          {BARS.map((h) => (
            <span key={h} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className={`${styles.card} ${styles.focus}`}>
        <small>Enfoque</small>
        <div className={styles.ring}><strong>25:00</strong><span>Trabajo profundo</span></div>
      </div>
      <div className={`${styles.card} ${styles.project}`}>
        <small>Proyecto actual</small>
        <strong>Landing On-going</strong>
        <div className={styles.track}><span /></div>
        <ul>
          <li className={styles.done}><span className={styles.box}><Icon name="check" size={13} /></span>Diseño visual</li>
          <li><span className={styles.box} />Desarrollo</li>
        </ul>
      </div>
    </div>
  )
}

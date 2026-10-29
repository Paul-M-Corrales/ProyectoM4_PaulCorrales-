import { Icon } from '@/components/ui/Icon'
import styles from './mini-mocks.module.css'

const ITEMS = [
  { label: 'Revisar correos', done: false },
  { label: 'Diseño de propuesta', done: true },
  { label: 'Reunión con el equipo', done: false },
] as const

const DAYS = [30, 44, 58, 72, 40, 66, 36] as const
const LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const

/** Maquetas ilustrativas de producto (no usan datos reales). */
export function ChecklistMock() {
  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <strong>Mis tareas</strong>
        <span className={styles.plus}><Icon name="plus" size={16} /></span>
      </div>
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.label} className={item.done ? styles.done : ''}>
            <span className={styles.box}>{item.done && <Icon name="check" size={12} />}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProgressMock() {
  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <strong>Tu progreso</strong>
        <small className={styles.select}>Esta semana</small>
      </div>
      <div className={styles.chart}>
        {DAYS.map((h, i) => (
          <span key={LETTERS[i]} className={styles.col}>
            <span style={{ height: `${h}%` }} />
            <small>{LETTERS[i]}</small>
          </span>
        ))}
      </div>
    </div>
  )
}

export function FocusMock() {
  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <small>Modo enfoque</small>
        <span className={styles.toggle}><span /></span>
      </div>
      <div className={styles.timer}>
        <strong>25:00</strong>
        <small>Trabajo profundo</small>
      </div>
    </div>
  )
}

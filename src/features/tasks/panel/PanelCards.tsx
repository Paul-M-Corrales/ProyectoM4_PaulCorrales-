import { Icon } from '@/components/ui/Icon'
import { progressRatio, type TaskProgress } from '@/features/mascot'
import { panelMessage } from './panelMessages'
import styles from './panel-cards.module.css'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const

export function KeepGoingCard({ progress }: { readonly progress: TaskProgress }) {
  const message = panelMessage(progress)
  return (
    <section className={`${styles.card} ${styles.yellow}`} aria-label="Ánimo">
      <span className={styles.badge}>
        <Icon name="trophy" size={18} />
        {message.badge}
      </span>
      <h2 className={styles.big}>Sigue avanzando</h2>
      <p>{message.text}</p>
    </section>
  )
}

export function RingCard({ progress }: { readonly progress: TaskProgress }) {
  const ratio = progressRatio(progress)
  const percent = Math.round(ratio * 100)
  return (
    <section className={`${styles.card} ${styles.white}`} aria-label="Tareas completadas">
      <h2 className={styles.label}>Tareas completadas</h2>
      <div
        className={styles.ring}
        role="progressbar"
        aria-label="Tareas completadas"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={RADIUS} className={styles.track} />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            className={styles.value}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          />
        </svg>
        <p className={styles.ringText}>
          <strong>{progress.completed}/{progress.total}</strong>
          <small>{percent}%</small>
        </p>
      </div>
    </section>
  )
}

export function WeeklyCard() {
  return (
    <section className={`${styles.card} ${styles.pink}`} aria-label="Progreso semanal">
      <h2 className={styles.label}>Progreso semanal</h2>
      <p className={styles.empty}>Aún no hay datos</p>
      <div className={styles.bars} aria-hidden="true">
        {DAYS.map((day) => (
          <span key={day}><i />{day}</span>
        ))}
      </div>
    </section>
  )
}

export function StreakCard() {
  return (
    <section className={`${styles.card} ${styles.green}`} aria-label="Racha actual">
      <Icon name="flame" size={28} className={styles.flame} />
      <h2 className={styles.label}>Racha actual</h2>
      <p className={styles.empty}>Sin racha todavía</p>
    </section>
  )
}

export function QuoteCard() {
  return (
    <section className={`${styles.card} ${styles.lavender}`} aria-label="Lema">
      <Icon name="bolt" size={26} className={styles.bolt} />
      <p className={styles.quote}>Disciplina hoy, resultados mañana.</p>
    </section>
  )
}

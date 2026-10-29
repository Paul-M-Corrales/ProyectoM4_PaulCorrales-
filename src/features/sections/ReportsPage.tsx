import { Icon, type IconName } from '@/components/ui/Icon'
import { SectionPage } from './SectionPage'
import styles from './cards.module.css'

const SLOTS: readonly { tone: string; icon: IconName; title: string; text: string }[] = [
  { tone: 'green', icon: 'check', title: 'Tareas completadas', text: 'El total de tareas que cerraste.' },
  { tone: 'lavender', icon: 'bars', title: 'Productividad por período', text: 'Tu avance por semana y por mes.' },
  { tone: 'yellow', icon: 'clock', title: 'Progreso', text: 'La evolución de tus objetivos.' },
  { tone: 'pink', icon: 'flame', title: 'Indicadores y gráficos', text: 'Rachas y tendencias a lo largo del tiempo.' },
]

export function ReportsPage() {
  return (
    <SectionPage
      title="Reportes"
      lead="Los reportes se calcularán a partir de tus tareas, que todavía no están conectadas. Por ahora no hay datos para mostrar."
    >
      <ul className={styles.grid} aria-label="Reportes previstos">
        {SLOTS.map((slot) => (
          <li key={slot.title} className={`${styles.card} ${styles[slot.tone]}`}>
            <span className={styles.icon}><Icon name={slot.icon} size={22} /></span>
            <h2>{slot.title}</h2>
            <p>{slot.text}</p>
            <span className={styles.pending}>Disponible con tus datos reales</span>
          </li>
        ))}
      </ul>
    </SectionPage>
  )
}

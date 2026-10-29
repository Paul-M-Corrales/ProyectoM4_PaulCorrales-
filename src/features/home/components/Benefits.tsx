import { Icon, type IconName } from '@/components/ui/Icon'
import styles from './benefits.module.css'

const BENEFITS: readonly { icon: IconName; tone: string; title: string; text: string }[] = [
  { icon: 'check', tone: 'green', title: 'Fácil de usar', text: 'Empieza en minutos' },
  { icon: 'heart', tone: 'pink', title: 'Más enfoque', text: 'Menos distracciones' },
  { icon: 'bars', tone: 'violet', title: 'Resultados reales', text: 'Avanza cada día' },
]

export function Benefits() {
  return (
    <ul className={styles.list}>
      {BENEFITS.map((item) => (
        <li key={item.title} className={styles.item}>
          <span className={`${styles.icon} ${styles[item.tone]}`}>
            <Icon name={item.icon} size={20} />
          </span>
          <span>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </span>
        </li>
      ))}
    </ul>
  )
}

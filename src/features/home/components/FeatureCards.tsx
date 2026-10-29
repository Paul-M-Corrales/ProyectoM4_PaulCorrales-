import styles from './feature-cards.module.css'

const FEATURES = [
  {
    icon: '☑',
    title: 'Organizá tus tareas',
    text: 'Reuní todo lo pendiente en un solo lugar, con prioridades y fechas límite claras.',
  },
  {
    icon: '↗',
    title: 'Sigue tu progreso',
    text: 'Mirá cuánto completaste y deja que el conejo pedalee más rápido con cada avance.',
  },
  {
    icon: '◎',
    title: 'Enfocate de verdad',
    text: 'Filtra y busca para quedarte solo con lo que importa ahora y dejar el ruido afuera.',
  },
] as const

export function FeatureCards() {
  return (
    <section id="funcionalidades" className={styles.section} aria-labelledby="features-title">
      <h2 id="features-title" className={styles.heading}>Todo lo que necesitás para avanzar</h2>
      <ul className={styles.grid}>
        {FEATURES.map((feature) => (
          <li key={feature.title} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

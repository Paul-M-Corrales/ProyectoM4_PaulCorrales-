import { Link } from 'react-router'
import { HeroMascot } from './HeroMascot'
import { ProductivityVisuals } from './ProductivityVisuals'
import styles from './hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Tu espacio de productividad</p>
        <h1 id="hero-title" className={styles.title}>
          Organizá tus tareas y <span className={styles.accent}>sigue avanzando</span>
        </h1>
        <p className={styles.lead}>
          On-going reúne tus pendientes, prioridades y fechas en un solo lugar para que cada día
          sepas qué hacer primero y veas cómo avanzás, tarea por tarea.
        </p>
        <div className={styles.actions}>
          <Link to="/tareas" className={styles.primary}>Ir a Mis tareas</Link>
          <a href="#funcionalidades" className={styles.secondary}>Conocer funcionalidades</a>
        </div>
      </div>
      <div className={styles.visual}>
        <ProductivityVisuals />
        <HeroMascot className={styles.mascot} />
      </div>
    </section>
  )
}

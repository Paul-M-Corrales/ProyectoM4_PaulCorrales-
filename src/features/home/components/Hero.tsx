import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Benefits } from './Benefits'
import { HeroStage } from './HeroStage'
import styles from './hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.copy}>
        <Eyebrow>Tu día, en movimiento</Eyebrow>
        <h1 id="hero-title" className={styles.title}>
          Organizá mejor.
          <br />
          Avanzá todos los días.
        </h1>
        <p className={styles.lead}>
          On-going te ayuda a organizar tus tareas, mantener el enfoque y ver tu progreso, para que
          cada día cuente.
        </p>
        <div className={styles.actions}>
          <ButtonLink to="/tareas" iconAfter="arrow">Ir a mis tareas</ButtonLink>
          <ButtonAnchor href="#como-funciona" variant="outline" icon="play">
            Ver cómo funciona
          </ButtonAnchor>
        </div>
        <Benefits />
      </div>
      <HeroStage />
    </section>
  )
}

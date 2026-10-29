import { FloatingCards } from './FloatingCards'
import { HeroMascot } from './HeroMascot'
import { Shapes } from './Shapes'
import styles from './hero-stage.module.css'

/** Escenario derecho de Inicio: formas de color, tarjetas ilustrativas y el conejo 3D. */
export function HeroStage() {
  return (
    <div className={styles.stage}>
      <Shapes />
      <HeroMascot className={styles.mascot ?? ''} />
      <FloatingCards />
      <p className={styles.caption}>Ilustración de ejemplo</p>
    </div>
  )
}

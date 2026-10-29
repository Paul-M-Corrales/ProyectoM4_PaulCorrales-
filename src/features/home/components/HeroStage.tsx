import { HeroMascot } from './HeroMascot'
import { Shapes } from './Shapes'
import styles from './hero-stage.module.css'

/** Escenario derecho de Inicio: formas de color detrás del conejo 3D, sin elementos encima. */
export function HeroStage() {
  return (
    <div className={styles.stage}>
      <Shapes />
      <HeroMascot className={styles.mascot ?? ''} />
    </div>
  )
}

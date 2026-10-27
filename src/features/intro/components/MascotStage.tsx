import { motion } from 'motion/react'
import { useRef } from 'react'
import { Mascot } from '@/features/mascot'
import type { ClipName, MascotStatus } from '@/features/mascot'
import { useElementHeight } from '../hooks/useElementHeight'
import { useWalkMotion } from '../hooks/useWalkMotion'
import type { IntroPhase } from '../introTypes'
import styles from './mascot-stage.module.css'

interface Props {
  readonly phase: IntroPhase
  readonly settled: boolean
  readonly clip: ClipName
  readonly playId: number
  readonly reducedMotion: boolean
  readonly onClipFinished: ((clip: ClipName) => void) | undefined
  readonly onStatusChange: (status: MascotStatus) => void
}

export function MascotStage({ phase, settled, clip, playId, reducedMotion, ...handlers }: Props) {
  const slotRef = useRef<HTMLDivElement>(null)
  const height = useElementHeight(slotRef)
  const x = useWalkMotion(phase, height, settled)

  return (
    <div className={styles.stage}>
      <motion.div ref={slotRef} className={styles.slot} style={{ x }} data-phase={phase}>
        <Mascot
          clip={clip}
          playId={playId}
          label="Conejo 3D, la mascota de On-going, que presenta el formulario de inicio de sesión"
          reducedMotion={reducedMotion}
          onClipFinished={handlers.onClipFinished}
          onStatusChange={handlers.onStatusChange}
        />
      </motion.div>
    </div>
  )
}

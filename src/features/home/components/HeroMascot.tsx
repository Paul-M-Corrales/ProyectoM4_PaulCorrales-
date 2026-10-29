import { Mascot, useClipSequence, type ClipName } from '@/features/mascot'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import styles from './hero-mascot.module.css'

/** El conejo entra, saluda, levanta el puño y queda en idle sin repetir el saludo. */
const HERO_SEQUENCE: readonly ClipName[] = ['welcome', 'idle']

export function HeroMascot({ className }: { readonly className?: string | undefined }) {
  const reducedMotion = usePrefersReducedMotion()
  const sequence = useClipSequence(HERO_SEQUENCE, { reducedMotion })

  return (
    <div className={`${styles.entrance} ${className ?? ''}`}>
      <Mascot
        clip={sequence.clip}
        playId={sequence.playId}
        label="Conejo mascota de On-going saludando"
        reducedMotion={reducedMotion}
        onClipFinished={sequence.advance}
      />
    </div>
  )
}

import { Mascot } from '@/features/mascot'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import styles from './hero-mascot.module.css'

/** El conejo permanece en postura natural (idle): mira al frente con ambos brazos abajo, sin gestos. */
export function HeroMascot({ className }: { readonly className?: string | undefined }) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className={`${styles.entrance} ${className ?? ''}`}>
      <Mascot
        clip="idle"
        playId={0}
        label="Conejo mascota de On-going"
        reducedMotion={reducedMotion}
      />
    </div>
  )
}

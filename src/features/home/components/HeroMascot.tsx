import { Mascot, useClipSequence, type ClipName } from '@/features/mascot'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const HERO_SEQUENCE: readonly ClipName[] = ['point', 'idle']

/** Mascota original de On-going: saluda una vez y queda en reposo. */
export function HeroMascot({ className }: { readonly className?: string | undefined }) {
  const reducedMotion = usePrefersReducedMotion()
  const sequence = useClipSequence(HERO_SEQUENCE, { reducedMotion })

  return (
    <Mascot
      clip={sequence.clip}
      playId={sequence.playId}
      label="Conejo mascota de On-going"
      reducedMotion={reducedMotion}
      onClipFinished={sequence.advance}
      {...(className ? { className } : {})}
    />
  )
}

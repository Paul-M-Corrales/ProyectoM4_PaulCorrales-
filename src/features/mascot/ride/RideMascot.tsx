import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Mascot } from '../Mascot'
import type { MascotStatus } from '../contracts'
import type { TaskProgress } from './rideProgress'
import { useRideMascot } from './useRideMascot'

interface Props {
  readonly progress: TaskProgress
  readonly ready?: boolean
  readonly resetKey?: string | null
  readonly className?: string | undefined
  readonly onStatusChange?: (status: MascotStatus) => void
}

/** Conejo en su bicicleta fija: el pedaleo refleja el progreso real de tareas recibido por props. */
export function RideMascot({ progress, ready, resetKey, className, onStatusChange }: Props) {
  const reducedMotion = usePrefersReducedMotion()
  const ride = useRideMascot(progress, {
    reducedMotion,
    ...(ready !== undefined && { ready }),
    ...(resetKey !== undefined && { resetKey }),
  })

  return (
    <Mascot
      clip={ride.clip}
      speed={ride.speed}
      label="Conejo de On-going pedaleando en su bicicleta fija"
      reducedMotion={reducedMotion}
      onClipFinished={ride.onClipFinished}
      {...(className ? { className } : {})}
      {...(onStatusChange ? { onStatusChange } : {})}
    />
  )
}

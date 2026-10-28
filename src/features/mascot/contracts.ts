export const CLIP_NAMES = [
  'walk',
  'stop',
  'point',
  'idle',
  'ride',
  'ride-idle',
  'ride-mount',
  'ride-celebrate',
] as const

export type ClipName = (typeof CLIP_NAMES)[number]

export interface ClipConfig {
  /** Repeticiones antes de disparar onClipFinished. Infinity = bucle continuo. */
  readonly repetitions: number
  /** Si el clip necesita la bicicleta visible. */
  readonly bike: boolean
  /** Duración nominal en segundos, medida en el GLB. */
  readonly durationSec: number
}

export type MascotStatus = 'loading' | 'ready' | 'error' | 'unsupported'

export interface MascotProps {
  /** Clip que debe reproducirse. */
  readonly clip: ClipName
  /** Cambia para relanzar el mismo clip desde el inicio. */
  readonly playId?: number
  /** Texto accesible que describe a la mascota. */
  readonly label: string
  /** Congela la animación (prefers-reduced-motion). */
  readonly reducedMotion?: boolean
  /** Giro (rad) sobre el eje vertical, leído en cada fotograma; 0 = de frente a la cámara. */
  readonly getYaw?: (() => number) | undefined
  /** Se dispara cuando un clip finito termina. */
  readonly onClipFinished?: ((clip: ClipName) => void) | undefined
  readonly onStatusChange?: ((status: MascotStatus) => void) | undefined
  readonly className?: string
}

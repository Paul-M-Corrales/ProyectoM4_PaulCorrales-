import { CLIPS } from '@/features/mascot/clips'

export const OPENING_MS = 1200
/** Tiempo desde que empieza `point` hasta que el brazo está extendido y aparece el login. */
export const REVEAL_DELAY_MS = 450
export const INTRO_STORAGE_KEY = 'ongoing:intro-played'

/**
 * Desplazamiento por ciclo de caminata, en alturas del escenario.
 * Mantiene la velocidad del conejo acorde con su zancada para evitar el patinaje.
 */
export const STRIDE_PER_CYCLE = 0.62
/** Tramo final que recorre el conejo mientras frena durante `stop`. */
export const STOP_TRAVEL = 0.18

export const WALK_SEC = CLIPS.walk.durationSec * CLIPS.walk.repetitions
export const STOP_SEC = CLIPS.stop.durationSec
export const START_OFFSET = STRIDE_PER_CYCLE * CLIPS.walk.repetitions + STOP_TRAVEL
/** Posición fuera de pantalla mientras aún no se conoce la altura del escenario. */
export const OFFSCREEN_PX = -4000

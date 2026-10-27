import type { ClipConfig, ClipName } from './contracts'

export const MASCOT_URL = '/mascot/rabbit.glb'
export const BIKE_NODE_NAME = 'Bike'
export const CROSSFADE_SEC = 0.2

export const CLIPS: Readonly<Record<ClipName, ClipConfig>> = {
  walk: { repetitions: 3, bike: false, durationSec: 1.03 },
  stop: { repetitions: 1, bike: false, durationSec: 0.53 },
  point: { repetitions: 1, bike: false, durationSec: 1.23 },
  idle: { repetitions: Infinity, bike: false, durationSec: 3.03 },
  ride: { repetitions: Infinity, bike: true, durationSec: 1.03 },
  'ride-idle': { repetitions: Infinity, bike: true, durationSec: 3.03 },
  'ride-mount': { repetitions: 1, bike: true, durationSec: 3.33 },
  'ride-celebrate': { repetitions: 1, bike: true, durationSec: 3.5 },
}

/** Secuencia definitiva de bienvenida del login. */
export const LOGIN_SEQUENCE: readonly ClipName[] = ['walk', 'stop', 'point', 'idle']

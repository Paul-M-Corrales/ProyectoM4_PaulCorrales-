export type IntroPhase = 'opening' | 'walk' | 'stop' | 'point' | 'idle'

/** Fase de la intro para cada índice de LOGIN_SEQUENCE. */
export const PHASE_BY_INDEX: readonly IntroPhase[] = ['walk', 'stop', 'point', 'idle']

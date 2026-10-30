import {
  MAX_PEDAL_SPEED,
  MIN_PEDAL_SPEED,
  progressRatio,
  rideStateFor,
} from '@/features/mascot/ride/rideProgress'

describe('rideStateFor', () => {
  it('sin tareas o con 0 %: reposo', () => {
    expect(rideStateFor({ total: 0, completed: 0 }).clip).toBe('ride-idle')
    expect(rideStateFor({ total: 5, completed: 0 }).clip).toBe('ride-idle')
  })

  it('progreso parcial: pedalea y acelera con el avance', () => {
    const low = rideStateFor({ total: 10, completed: 1 })
    const high = rideStateFor({ total: 10, completed: 9 })
    expect(low.clip).toBe('ride')
    expect(high.clip).toBe('ride')
    expect(high.speed).toBeGreaterThan(low.speed)
    expect(low.speed).toBeGreaterThanOrEqual(MIN_PEDAL_SPEED)
    expect(high.speed).toBeLessThanOrEqual(MAX_PEDAL_SPEED)
  })

  it('100 %: reposo (la celebración es un evento, no un estado)', () => {
    expect(rideStateFor({ total: 4, completed: 4 })).toEqual({ clip: 'ride-idle', speed: 1 })
  })

  it('valores inválidos no inventan progreso', () => {
    expect(progressRatio({ total: 3, completed: 9 })).toBe(1)
    expect(progressRatio({ total: Number.NaN, completed: 1 })).toBe(0)
    expect(progressRatio({ total: 5, completed: -2 })).toBe(0)
  })
})

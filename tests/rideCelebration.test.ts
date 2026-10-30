import { act, renderHook } from '@testing-library/react'
import { shouldCelebrate, type ProgressSnapshot } from '@/features/mascot/ride/celebration'
import { useRideMascot } from '@/features/mascot/ride/useRideMascot'

const snap = (completed: number, total: number, ready = true): ProgressSnapshot => ({ completed, total, ready })

describe('shouldCelebrate', () => {
  it('celebra al completar la última tarea pendiente', () => {
    expect(shouldCelebrate(snap(3, 4), snap(4, 4))).toBe(true)
    expect(shouldCelebrate(snap(0, 1), snap(1, 1))).toBe(true)
  })

  it('no celebra al cargar datos, sin tareas, al borrar ni al desmarcar', () => {
    expect(shouldCelebrate(snap(0, 0, false), snap(4, 4))).toBe(false)
    expect(shouldCelebrate(snap(0, 0), snap(0, 0))).toBe(false)
    expect(shouldCelebrate(snap(1, 2), snap(1, 1))).toBe(false)
    expect(shouldCelebrate(snap(4, 4), snap(3, 4))).toBe(false)
    expect(shouldCelebrate(snap(4, 4), snap(4, 4))).toBe(false)
    expect(shouldCelebrate(snap(3, 4), snap(4, 4, false))).toBe(false)
  })
})

type Props = { done: number; total?: number; ready?: boolean; key?: string }
const setup = (initial: Props, options: { reducedMotion?: boolean } = {}) =>
  renderHook(
    ({ done, total = 4, ready = true, key = 'u1' }: Props) =>
      useRideMascot({ total, completed: done }, { ...options, ready, resetKey: key }),
    { initialProps: initial },
  )

describe('useRideMascot con progreso real', () => {
  it('sube a la bici una vez y luego sigue el progreso, sin celebrar al cargar todo completo', () => {
    const { result, rerender } = setup({ done: 4, ready: false, total: 0 })
    expect(result.current.clip).toBe('ride-mount')
    rerender({ done: 4, total: 4 })
    act(() => result.current.onClipFinished('ride-mount'))
    expect(result.current.clip).toBe('ride')
    expect(result.current.speed).toBeGreaterThan(2)
  })

  it('celebra exactamente una vez al completar la última tarea y vuelve a un estado estable', () => {
    const { result, rerender } = setup({ done: 3 })
    act(() => result.current.onClipFinished('ride-mount'))
    expect(result.current.clip).toBe('ride')
    rerender({ done: 4 })
    expect(result.current.clip).toBe('ride-celebrate')
    rerender({ done: 4 })
    expect(result.current.clip).toBe('ride-celebrate')
    act(() => result.current.onClipFinished('ride-celebrate'))
    expect(result.current.clip).toBe('ride')
    rerender({ done: 4 })
    expect(result.current.clip).toBe('ride')
  })

  it('al desmarcar recalcula de inmediato y al volver a completar celebra de nuevo', () => {
    const { result, rerender } = setup({ done: 3 })
    act(() => result.current.onClipFinished('ride-mount'))
    rerender({ done: 4 })
    act(() => result.current.onClipFinished('ride-celebrate'))
    rerender({ done: 3 })
    expect(result.current.clip).toBe('ride')
    rerender({ done: 4 })
    expect(result.current.clip).toBe('ride-celebrate')
  })

  it('la velocidad crece con el porcentaje y 0 % queda en reposo', () => {
    const { result, rerender } = setup({ done: 0 })
    act(() => result.current.onClipFinished('ride-mount'))
    expect(result.current.clip).toBe('ride-idle')
    rerender({ done: 1 })
    const slow = result.current.speed
    rerender({ done: 3 })
    expect(result.current.speed).toBeGreaterThan(slow)
  })

  it('borrar la tarea pendiente (cambia el denominador) no celebra', () => {
    const { result, rerender } = setup({ done: 1, total: 2 })
    act(() => result.current.onClipFinished('ride-mount'))
    rerender({ done: 1, total: 1 })
    expect(result.current.clip).toBe('ride')
  })

  it('sin tareas no celebra y al cambiar de usuario se reinicia la celebración en curso', () => {
    const { result, rerender } = setup({ done: 3 })
    act(() => result.current.onClipFinished('ride-mount'))
    rerender({ done: 4 })
    expect(result.current.clip).toBe('ride-celebrate')
    rerender({ done: 0, total: 0, key: 'u2' })
    expect(result.current.clip).toBe('ride-idle')
  })

  it('con movimiento reducido no hay montaje ni celebración', () => {
    const { result, rerender } = setup({ done: 3 }, { reducedMotion: true })
    expect(result.current.clip).toBe('ride')
    rerender({ done: 4 })
    expect(result.current.clip).toBe('ride')
  })
})

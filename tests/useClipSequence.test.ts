import { act, renderHook } from '@testing-library/react'
import { LOGIN_SEQUENCE } from '@/features/mascot/clips'
import { useClipSequence } from '@/features/mascot/useClipSequence'

describe('useClipSequence', () => {
  it('avanza cuando termina el clip actual', () => {
    const { result } = renderHook(() => useClipSequence(LOGIN_SEQUENCE))
    expect(result.current.clip).toBe('walk')
    act(() => result.current.advance('walk'))
    expect(result.current.clip).toBe('stop')
    act(() => result.current.advance('stop'))
    act(() => result.current.advance('point'))
    expect(result.current.clip).toBe('idle')
    expect(result.current.isLast).toBe(true)
  })

  it('ignora finales de clips que no son el actual y no pasa del último', () => {
    const { result } = renderHook(() => useClipSequence(LOGIN_SEQUENCE))
    act(() => result.current.advance('point'))
    expect(result.current.clip).toBe('walk')
    for (const c of LOGIN_SEQUENCE) act(() => result.current.advance(c))
    act(() => result.current.advance('idle'))
    expect(result.current.clip).toBe('idle')
  })

  it('restart vuelve al inicio e incrementa playId', () => {
    const { result } = renderHook(() => useClipSequence(LOGIN_SEQUENCE))
    act(() => result.current.advance('walk'))
    act(() => result.current.restart())
    expect(result.current.clip).toBe('walk')
    expect(result.current.playId).toBe(1)
  })

  it('con movimiento reducido salta al último clip', () => {
    const { result } = renderHook(() =>
      useClipSequence(LOGIN_SEQUENCE, { reducedMotion: true }),
    )
    expect(result.current.clip).toBe('idle')
  })
})

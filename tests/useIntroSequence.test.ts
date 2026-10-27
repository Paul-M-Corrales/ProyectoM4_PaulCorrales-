import { act, renderHook } from '@testing-library/react'
import { useIntroSequence } from '@/features/intro/hooks/useIntroSequence'
import { OPENING_MS, REVEAL_DELAY_MS } from '@/features/intro/introTimeline'
import type { MascotStatus } from '@/features/mascot'

interface Props {
  status: MascotStatus
  reducedMotion: boolean
}

function setup(initial: Props) {
  return renderHook((props: Props) => useIntroSequence(props), { initialProps: initial })
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('useIntroSequence', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('espera la apertura y la carga antes de caminar', () => {
    const { result, rerender } = setup({ status: 'loading', reducedMotion: false })
    expect(result.current.phase).toBe('opening')
    advance(OPENING_MS)
    expect(result.current.phase).toBe('opening')
    rerender({ status: 'ready', reducedMotion: false })
    expect(result.current.phase).toBe('walk')
    expect(result.current.clip).toBe('walk')
  })

  it('recorre walk → stop → point, revela el login y termina en idle', () => {
    const { result } = setup({ status: 'ready', reducedMotion: false })
    advance(OPENING_MS)
    act(() => result.current.onClipFinished?.('walk'))
    expect(result.current.phase).toBe('stop')
    act(() => result.current.onClipFinished?.('stop'))
    expect(result.current.phase).toBe('point')
    expect(result.current.revealed).toBe(false)
    advance(REVEAL_DELAY_MS)
    expect(result.current.revealed).toBe(true)
    act(() => result.current.onClipFinished?.('point'))
    expect(result.current.phase).toBe('idle')
    expect(result.current.settled).toBe(true)
    expect(window.sessionStorage.getItem('ongoing:intro-played')).toBe('1')
  })

  it('omitir en plena transición deja el login visible y la mascota en idle', () => {
    const { result } = setup({ status: 'ready', reducedMotion: false })
    advance(OPENING_MS)
    act(() => result.current.onClipFinished?.('walk'))
    act(() => result.current.skip())
    expect(result.current).toMatchObject({
      phase: 'idle',
      settled: true,
      revealed: true,
      clip: 'idle',
    })
    expect(result.current.onClipFinished).toBeUndefined()
    expect(window.sessionStorage.getItem('ongoing:intro-played')).toBe('1')
  })

  it('con movimiento reducido no anima ni persiste', () => {
    const { result } = setup({ status: 'ready', reducedMotion: true })
    expect(result.current).toMatchObject({ phase: 'idle', settled: true, revealed: true })
    expect(window.sessionStorage.getItem('ongoing:intro-played')).toBeNull()
  })

  it('no repite la intro si ya se reprodujo en la sesión', () => {
    window.sessionStorage.setItem('ongoing:intro-played', '1')
    const { result } = setup({ status: 'ready', reducedMotion: false })
    expect(result.current).toMatchObject({ phase: 'idle', settled: true, revealed: true })
  })

  it.each(['error', 'unsupported'] as const)('muestra el login si la mascota falla (%s)', (status) => {
    const { result } = setup({ status, reducedMotion: false })
    expect(result.current.revealed).toBe(true)
  })

  it('limpia los temporizadores al desmontar', () => {
    const { unmount } = setup({ status: 'ready', reducedMotion: false })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

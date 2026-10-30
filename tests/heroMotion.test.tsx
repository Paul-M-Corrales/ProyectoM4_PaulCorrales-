import { render } from '@testing-library/react'
import { HeroMascot } from '@/features/home/components/HeroMascot'

function mockReducedMotion(reduced: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduced,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}

describe('mascota de Inicio', () => {
  it.each([false, true])('queda en idle (brazos abajo, sin gestos) con reduced-motion=%s', (reduced) => {
    mockReducedMotion(reduced)
    const { container } = render(<HeroMascot />)
    expect(container.querySelector('[data-clip]')).toHaveAttribute('data-clip', 'idle')
  })
})

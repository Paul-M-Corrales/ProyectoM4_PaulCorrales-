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
  it('con movimiento normal arranca con el clip welcome', () => {
    mockReducedMotion(false)
    const { container } = render(<HeroMascot />)
    expect(container.querySelector('[data-clip]')).toHaveAttribute('data-clip', 'welcome')
  })

  it('con prefers-reduced-motion muestra directamente idle', () => {
    mockReducedMotion(true)
    const { container } = render(<HeroMascot />)
    expect(container.querySelector('[data-clip]')).toHaveAttribute('data-clip', 'idle')
  })
})

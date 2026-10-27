import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from '@/app/AppRoutes'

beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
})

describe('rutas', () => {
  it('la raíz muestra el wordmark de On-going', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'On-going' })).toBeInTheDocument()
  })

  it('/dev/mascot muestra el laboratorio con los 8 clips', async () => {
    render(
      <MemoryRouter initialEntries={['/dev/mascot']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /laboratorio/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { pressed: false }).length).toBeGreaterThanOrEqual(7)
    expect(screen.getByRole('button', { name: /ride-celebrate/ })).toBeInTheDocument()
  })
})

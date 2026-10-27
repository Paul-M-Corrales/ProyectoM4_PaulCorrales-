import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from '@/app/AppRoutes'

describe('rutas', () => {
  it('la raíz muestra el login', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Entrá a tu rutina' })).toBeInTheDocument()
  })

  it('en desarrollo existe /dev/mascot con los 8 clips', async () => {
    render(
      <MemoryRouter initialEntries={['/dev/mascot']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('heading', { name: /laboratorio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ride-celebrate/ })).toBeInTheDocument()
  })
})

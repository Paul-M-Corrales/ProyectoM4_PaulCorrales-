import { screen, waitFor } from '@testing-library/react'
import { renderApp, fakeGateway } from './auth/helpers'

describe('rutas', () => {
  it('la raíz muestra el login', async () => {
    const gateway = fakeGateway()
    renderApp(gateway)
    await waitFor(() => expect(gateway.onAuthChange).toHaveBeenCalled())
    gateway.emit(null)
    expect(await screen.findByRole('heading', { name: 'Entrá a tu rutina' })).toBeInTheDocument()
  })

  it('en desarrollo existe /dev/ride con el modo de prueba aislado', async () => {
    renderApp(fakeGateway(), '/dev/ride')
    expect(await screen.findByRole('heading', { name: /conejo en bicicleta/i })).toBeInTheDocument()
    expect(screen.getByTestId('ride-state')).toHaveTextContent('ride-idle')
  })

  it('en desarrollo existe /dev/mascot con los 8 clips', async () => {
    renderApp(fakeGateway(), '/dev/mascot')
    expect(await screen.findByRole('heading', { name: /laboratorio/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ride-celebrate/ })).toBeInTheDocument()
  })
})

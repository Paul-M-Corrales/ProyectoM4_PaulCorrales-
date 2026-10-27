import { render, screen } from '@testing-library/react'
import { Mascot } from '@/features/mascot/Mascot'
import { MascotErrorBoundary } from '@/features/mascot/MascotErrorBoundary'
import { isWebGLAvailable } from '@/lib/webgl'

describe('detección de WebGL', () => {
  it('devuelve false en jsdom (sin contexto WebGL)', () => {
    expect(isWebGLAvailable()).toBe(false)
  })

  it('devuelve false si crear el contexto lanza una excepción', () => {
    const spy = vi.spyOn(document, 'createElement').mockImplementation(() => {
      throw new Error('boom')
    })
    expect(isWebGLAvailable()).toBe(false)
    spy.mockRestore()
  })
})

describe('<Mascot />', () => {
  it('muestra un fallback accesible cuando no hay WebGL', () => {
    render(<Mascot clip="idle" label="Conejo de prueba" />)
    expect(screen.getByRole('img', { name: 'Conejo de prueba' })).toHaveAttribute(
      'data-status',
      'unsupported',
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/WebGL/)
  })

  it('notifica el estado al consumidor', () => {
    const onStatusChange = vi.fn()
    render(<Mascot clip="idle" label="x" onStatusChange={onStatusChange} />)
    expect(onStatusChange).toHaveBeenCalledWith('unsupported')
  })
})

describe('MascotErrorBoundary', () => {
  it('renderiza el fallback si un hijo falla', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onError = vi.fn()
    const Broken = () => {
      throw new Error('fallo de carga')
    }
    render(
      <MascotErrorBoundary fallback={<p role="alert">caído</p>} onError={onError}>
        <Broken />
      </MascotErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('caído')
    expect(onError).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})

import { render, screen } from '@testing-library/react'
import { LoginPage } from '@/features/auth/pages/LoginPage'

describe('<LoginPage />', () => {
  beforeEach(() => window.sessionStorage.clear())

  it('sin WebGL muestra el login completo, el fallback y no ofrece omitir', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: 'Entrá a tu rutina' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Conejo 3D/ })).toHaveAttribute(
      'data-status',
      'unsupported',
    )
    expect(screen.queryByRole('button', { name: 'Omitir introducción' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Entrá a tu rutina' })).not.toHaveAttribute('inert')
  })

  it('expone logo, campos y acciones requeridas', () => {
    render(<LoginPage />)
    for (const name of [
      'Iniciar sesión',
      'Continuar con Google',
      'Crear cuenta',
      'Recuperar contraseña',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByText('On-going')).toBeInTheDocument()
  })
})

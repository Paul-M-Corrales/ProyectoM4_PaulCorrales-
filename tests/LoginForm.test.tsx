import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { MemoryRouter } from 'react-router'
import { unconfiguredAuthGateway } from '@/features/auth/services/unconfiguredAuthGateway'
import type { AuthGateway, AuthResult } from '@/features/auth/types'

function gatewayWith(result: Promise<AuthResult>): AuthGateway {
  return {
    signInWithEmail: vi.fn(() => result),
    signInWithGoogle: vi.fn(() => result),
    signUpWithEmail: vi.fn(() => result),
    requestPasswordReset: vi.fn(() => result),
    signOut: vi.fn(() => result),
    onAuthChange: vi.fn(() => () => {}),
  }
}

const renderForm = (gateway: AuthGateway) =>
  render(
    <MemoryRouter>
      <LoginForm gateway={gateway} />
    </MemoryRouter>,
  )

describe('<LoginForm />', () => {
  it('muestra errores accesibles y enfoca el primer campo inválido', async () => {
    const user = userEvent.setup()
    renderForm(unconfiguredAuthGateway)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findAllByRole('alert')).toHaveLength(2)
    const email = screen.getByLabelText('Correo electrónico')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveFocus()
  })

  it('alterna la visibilidad de la contraseña', async () => {
    const user = userEvent.setup()
    renderForm(unconfiguredAuthGateway)
    const password = screen.getByLabelText('Contraseña')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: /mostrar contraseña/i }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('muestra estado de carga y bloquea acciones mientras espera', async () => {
    const user = userEvent.setup()
    let resolve: (r: AuthResult) => void = () => {}
    const gateway = gatewayWith(new Promise<AuthResult>((r) => (resolve = r)))
    renderForm(gateway)
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@dominio.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('button', { name: /Iniciando sesión/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Google/ })).toBeDisabled()
    resolve({ ok: false, code: 'invalid-credentials', message: 'Credenciales inválidas.' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas.')
  })

  it('informa que Firebase no está configurado y no simula un inicio de sesión', async () => {
    const user = userEvent.setup()
    renderForm(unconfiguredAuthGateway)
    await user.click(screen.getByRole('button', { name: /Continuar con Google/ }))
    expect(await screen.findByRole('status')).toHaveTextContent(/no está configurada/)
    expect(screen.queryByText(/sesión iniciada/i)).not.toBeInTheDocument()
  })

  it('recuperar contraseña y crear cuenta son enlaces a sus rutas', () => {
    renderForm(gatewayWith(Promise.resolve({ ok: true })))
    expect(screen.getByRole('link', { name: 'Recuperar contraseña' })).toHaveAttribute('href', '/recuperar-password')
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro')
  })

  it('un inicio de sesión exitoso muestra confirmación', async () => {
    const user = userEvent.setup()
    renderForm(gatewayWith(Promise.resolve({ ok: true })))
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@dominio.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('status')).toHaveTextContent(/Listo/)
  })

  it('el cierre del popup de Google es un aviso, no un error', async () => {
    const user = userEvent.setup()
    const cancelled: AuthResult = { ok: false, code: 'cancelled', message: 'Cancelaste el acceso con Google.' }
    renderForm(gatewayWith(Promise.resolve(cancelled)))
    await user.click(screen.getByRole('button', { name: /Continuar con Google/ }))
    expect(await screen.findByRole('status')).toHaveTextContent(/Cancelaste/)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('es utilizable solo con teclado (Tab y Enter)', async () => {
    const user = userEvent.setup()
    const gateway = gatewayWith(Promise.resolve({ ok: true }))
    renderForm(gateway)
    await user.tab()
    await user.keyboard('ana@dominio.com')
    await user.tab()
    await user.keyboard('secreta123{Enter}')
    await waitFor(() =>
      expect(gateway.signInWithEmail).toHaveBeenCalledWith('ana@dominio.com', 'secreta123'),
    )
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { pendingAuthGateway } from '@/features/auth/services/pendingAuthGateway'
import type { AuthGateway, AuthResult } from '@/features/auth/types'

function gatewayWith(result: Promise<AuthResult>): AuthGateway {
  return {
    signInWithEmail: vi.fn(() => result),
    signInWithGoogle: vi.fn(() => result),
    signUpWithEmail: vi.fn(() => result),
    requestPasswordReset: vi.fn(() => result),
  }
}

describe('<LoginForm />', () => {
  it('muestra errores accesibles y enfoca el primer campo inválido', async () => {
    const user = userEvent.setup()
    render(<LoginForm gateway={pendingAuthGateway} />)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findAllByRole('alert')).toHaveLength(2)
    const email = screen.getByLabelText('Correo electrónico')
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveFocus()
  })

  it('alterna la visibilidad de la contraseña', async () => {
    const user = userEvent.setup()
    render(<LoginForm gateway={pendingAuthGateway} />)
    const password = screen.getByLabelText('Contraseña')
    expect(password).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: /mostrar contraseña/i }))
    expect(password).toHaveAttribute('type', 'text')
  })

  it('muestra estado de carga y bloquea acciones mientras espera', async () => {
    const user = userEvent.setup()
    let resolve: (r: AuthResult) => void = () => {}
    const gateway = gatewayWith(new Promise<AuthResult>((r) => (resolve = r)))
    render(<LoginForm gateway={gateway} />)
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@dominio.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('button', { name: /Iniciando sesión/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Google/ })).toBeDisabled()
    resolve({ ok: false, code: 'invalid-credentials', message: 'Credenciales inválidas.' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas.')
  })

  it('informa que Firebase está pendiente y no simula un inicio de sesión', async () => {
    const user = userEvent.setup()
    render(<LoginForm gateway={pendingAuthGateway} />)
    await user.click(screen.getByRole('button', { name: /Continuar con Google/ }))
    expect(await screen.findByRole('status')).toHaveTextContent(/ONGOING-M4-003/)
    expect(screen.queryByText(/sesión iniciada/i)).not.toBeInTheDocument()
  })

  it('recuperar y crear cuenta validan antes de llamar al gateway', async () => {
    const user = userEvent.setup()
    const gateway = gatewayWith(Promise.resolve({ ok: true }))
    render(<LoginForm gateway={gateway} />)
    await user.click(screen.getByRole('button', { name: 'Recuperar contraseña' }))
    expect(gateway.requestPasswordReset).not.toHaveBeenCalled()
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@dominio.com')
    await user.click(screen.getByRole('button', { name: 'Recuperar contraseña' }))
    await waitFor(() =>
      expect(gateway.requestPasswordReset).toHaveBeenCalledWith('ana@dominio.com'),
    )
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(gateway.signUpWithEmail).not.toHaveBeenCalled()
  })

  it('es utilizable solo con teclado (Tab y Enter)', async () => {
    const user = userEvent.setup()
    const gateway = gatewayWith(Promise.resolve({ ok: true }))
    render(<LoginForm gateway={gateway} />)
    await user.tab()
    await user.keyboard('ana@dominio.com')
    await user.tab()
    await user.keyboard('secreta123{Enter}')
    await waitFor(() =>
      expect(gateway.signInWithEmail).toHaveBeenCalledWith('ana@dominio.com', 'secreta123'),
    )
  })
})

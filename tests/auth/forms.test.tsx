import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fakeGateway, formAlerts, renderApp, USER } from './helpers'
import { RESET_NOTICE } from '@/features/auth/utils/firebaseErrors'

async function openAt(path: string) {
  const gateway = fakeGateway()
  renderApp(gateway, path)
  act(() => gateway.emit(null))
  await screen.findByRole('main')
  return gateway
}

describe('registro', () => {
  it('valores válidos llaman al gateway con el correo recortado', async () => {
    const user = userEvent.setup()
    const gateway = await openAt('/registro')
    await user.type(screen.getByLabelText('Correo electrónico'), ' ana@dominio.com ')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.type(screen.getByLabelText('Repetir contraseña'), 'secreta123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    await waitFor(() =>
      expect(gateway.signUpWithEmail).toHaveBeenCalledWith('ana@dominio.com', 'secreta123'),
    )
    act(() => gateway.emit(USER))
    expect(await screen.findByRole('heading', { name: /Bienvenido/ })).toBeInTheDocument()
  })

  it('valores inválidos no llegan al gateway y muestran errores en español', async () => {
    const user = userEvent.setup()
    const gateway = await openAt('/registro')
    await user.type(screen.getByLabelText('Correo electrónico'), 'no-es-correo')
    await user.type(screen.getByLabelText('Contraseña'), 'corta')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    await waitFor(() => expect(formAlerts()).toHaveLength(3))
    expect(screen.getByText(/al menos 8 caracteres/)).toBeInTheDocument()
    expect(gateway.signUpWithEmail).not.toHaveBeenCalled()
  })

  it('contraseñas distintas se rechazan', async () => {
    const user = userEvent.setup()
    const gateway = await openAt('/registro')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@dominio.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.type(screen.getByLabelText('Repetir contraseña'), 'otra-cosa-123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument()
    expect(gateway.signUpWithEmail).not.toHaveBeenCalled()
  })

  it('un error del proveedor se muestra y las acciones se bloquean mientras está pendiente', async () => {
    const user = userEvent.setup()
    const gateway = await openAt('/registro')
    let resolve: (r: never) => void = () => {}
    vi.mocked(gateway.signUpWithEmail).mockReturnValue(new Promise((r) => (resolve = r)))
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@dominio.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta123')
    await user.type(screen.getByLabelText('Repetir contraseña'), 'secreta123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByRole('button', { name: /Creando cuenta/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Google/ })).toBeDisabled()
    resolve({ ok: false, code: 'invalid-credentials', message: 'No pudimos crear la cuenta.' } as never)
    await waitFor(() => expect(formAlerts()[0]).toHaveTextContent('No pudimos crear la cuenta.'))
  })
})

describe('recuperación de contraseña', () => {
  it('correo inválido: no llama al gateway', async () => {
    const user = userEvent.setup()
    const gateway = await openAt('/recuperar-password')
    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }))
    await waitFor(() => expect(formAlerts()).toHaveLength(1))
    expect(gateway.requestPasswordReset).not.toHaveBeenCalled()
  })

  it('correo válido: muestra el aviso neutro devuelto por el gateway', async () => {
    const user = userEvent.setup()
    const gateway = await openAt('/recuperar-password')
    vi.mocked(gateway.requestPasswordReset).mockResolvedValue({ ok: true, message: RESET_NOTICE })
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@dominio.com')
    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }))
    expect(await screen.findByRole('status')).toHaveTextContent(/Si el correo está registrado/)
    expect(gateway.requestPasswordReset).toHaveBeenCalledWith('ana@dominio.com')
  })
})

describe('login con Google', () => {
  it('cancelar el popup muestra un aviso y deja reintentar', async () => {
    const user = userEvent.setup()
    const gateway = await openAt('/')
    vi.mocked(gateway.signInWithGoogle).mockResolvedValue({
      ok: false,
      code: 'cancelled',
      message: 'Cancelaste el acceso con Google.',
    })
    await user.click(await screen.findByRole('button', { name: /Continuar con Google/ }))
    expect(await screen.findByRole('status')).toHaveTextContent(/Cancelaste/)
    expect(screen.getByRole('button', { name: /Continuar con Google/ })).toBeEnabled()
  })
})

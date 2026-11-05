import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VerifyEmailNotice } from '@/features/tasks/components/VerifyEmailNotice'
import { EmailVerificationContext } from '@/features/tasks/context/emailVerificationContext'
import type { EmailVerificationService } from '@/features/tasks/services/emailVerificationService'
import { EMAIL, fakeVerification } from './tasks/fakeVerification'

function open(over: Partial<EmailVerificationService> = {}, onVerified = vi.fn()) {
  const service = fakeVerification(over)
  const view = render(
    <EmailVerificationContext value={service}>
      <VerifyEmailNotice onVerified={onVerified} />
    </EmailVerificationContext>,
  )
  return { service, onVerified, view }
}
const resend = () => screen.getByRole('button', { name: /^Reenviar correo|^Enviando/ })

beforeEach(() => sessionStorage.clear())

describe('aviso «Verificá tu correo electrónico»', () => {
  it('muestra título, correo, el envío automático, Spam y que puede tardar', async () => {
    const { service } = open()
    expect(screen.getByRole('heading', { name: 'Verificá tu correo electrónico' })).toBeInTheDocument()
    expect(screen.getByText(EMAIL)).toBeInTheDocument()
    expect(screen.getByText(/antes de acceder a las funciones que requieren verificación/)).toBeInTheDocument()
    const status = await screen.findByText(/Te enviamos un enlace de verificación/)
    expect(status).toHaveTextContent(/bandeja de entrada y también las carpetas de Spam o Correo no deseado/)
    expect(screen.getByText(/Puede tardar unos minutos/)).toBeInTheDocument()
    expect(service.send).toHaveBeenCalledTimes(1)
  })

  it('no vuelve a enviar solo al recargar la página en la misma sesión', async () => {
    const first = open()
    await screen.findByText(/Te enviamos/)
    first.view.unmount()
    const second = open()
    expect(screen.getByText(/Te enviamos un enlace/)).toBeInTheDocument()
    expect(second.service.send).not.toHaveBeenCalled()
  })

  it('muestra la carga y no afirma haber enviado nada si Firebase devuelve un error', async () => {
    let fail: (value: { ok: false; message: string }) => void = () => {}
    open({ send: vi.fn(() => new Promise<{ ok: false; message: string }>((resolve) => (fail = resolve))) })
    expect(screen.getByText('Enviando el enlace de verificación…')).toBeInTheDocument()
    expect(resend()).toBeDisabled()
    fail({ ok: false, message: 'Pediste demasiados correos.' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Pediste demasiados correos.')
    expect(screen.queryByText(/Te enviamos/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Spam/)).not.toBeInTheDocument()
    expect(resend()).toBeEnabled()
  })

  it('reenvía una sola vez aunque se haga doble clic y luego bloquea con cuenta atrás', async () => {
    const user = userEvent.setup()
    const send = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: 'Sin red.' })
      .mockResolvedValue({ ok: true })
    open({ send })
    await screen.findByRole('alert')
    await user.dblClick(resend())
    expect(send).toHaveBeenCalledTimes(2)
    expect(await screen.findByText(/Te enviamos un enlace/)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reenviar correo \(\d+ s\)/ })).toBeDisabled()
  })

  it('«Ya verifiqué mi correo»: pendiente, error y confirmación', async () => {
    const user = userEvent.setup()
    const refresh = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, verified: false })
      .mockResolvedValueOnce({ ok: false, message: 'No hay conexión.' })
      .mockResolvedValueOnce({ ok: true, verified: true })
    const { onVerified } = open({ refresh })
    const check = () => screen.getByRole('button', { name: 'Ya verifiqué mi correo' })
    await user.click(check())
    expect(await screen.findByText(/Todavía no figura como verificado/)).toBeInTheDocument()
    await user.click(check())
    expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión.')
    await user.click(check())
    await waitFor(() => expect(onVerified).toHaveBeenCalledTimes(1))
  })

  it('sin sesión no intenta enviar nada', () => {
    const { service } = open({ email: () => null })
    expect(service.send).not.toHaveBeenCalled()
    expect(screen.queryByText(/Cuenta:/)).not.toBeInTheDocument()
  })
})

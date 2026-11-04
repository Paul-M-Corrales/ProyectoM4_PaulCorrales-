import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryEmailAction } from '@/features/tasks/components/SummaryEmailAction'
import { EmailVerificationContext } from '@/features/tasks/context/emailVerificationContext'
import { SummaryEmailContext } from '@/features/tasks/context/summaryEmailContext'
import type { EmailVerificationService } from '@/features/tasks/services/emailVerificationService'
import type { SummaryEmailService } from '@/features/tasks/services/summaryEmailService'

function open(verification: Partial<EmailVerificationService>) {
  const summary: SummaryEmailService = { isEmailVerified: () => false, send: vi.fn(() => Promise.resolve({ ok: true as const })) }
  const service: EmailVerificationService = {
    isVerified: () => false,
    send: vi.fn(() => Promise.resolve({ ok: true as const })),
    refresh: vi.fn(() => Promise.resolve({ ok: true as const, verified: false })),
    ...verification,
  }
  render(
    <SummaryEmailContext value={summary}>
      <EmailVerificationContext value={service}>
        <SummaryEmailAction />
      </EmailVerificationContext>
    </SummaryEmailContext>,
  )
  return service
}
const summaryButton = () => screen.getByRole('button', { name: 'Enviar resumen por correo' })

describe('verificación de correo con Firebase Authentication', () => {
  it('con el correo sin verificar explica los pasos y mantiene deshabilitado el resumen', () => {
    open({})
    expect(summaryButton()).toBeDisabled()
    expect(screen.getByText(/Pedí el correo de verificación/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar correo de verificación' })).toBeEnabled()
  })

  it('envía el correo una sola vez aunque se haga doble clic y bloquea el reenvío con cuenta atrás', async () => {
    const user = userEvent.setup()
    const service = open({})
    const send = screen.getByRole('button', { name: 'Enviar correo de verificación' })
    await user.dblClick(send)
    expect(service.send).toHaveBeenCalledTimes(1)
    expect(await screen.findByText(/Te enviamos un correo de verificación/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reenviar en \d+ s/ })).toBeDisabled()
  })

  it('muestra el estado de carga mientras se envía', async () => {
    const user = userEvent.setup()
    let finish: (value: { ok: true }) => void = () => {}
    open({ send: vi.fn(() => new Promise<{ ok: true }>((resolve) => (finish = resolve))) })
    await user.click(screen.getByRole('button', { name: 'Enviar correo de verificación' }))
    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
    finish({ ok: true })
    await screen.findByText(/Te enviamos/)
  })

  it('muestra el error de Firebase sin habilitar el resumen ni la cuenta atrás', async () => {
    const user = userEvent.setup()
    open({ send: vi.fn(() => Promise.resolve({ ok: false as const, message: 'Pediste demasiados correos.' })) })
    await user.click(screen.getByRole('button', { name: 'Enviar correo de verificación' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Pediste demasiados correos.')
    expect(screen.getByRole('button', { name: 'Enviar correo de verificación' })).toBeEnabled()
    expect(summaryButton()).toBeDisabled()
  })

  it('si aún no verificó lo indica y sigue deshabilitado', async () => {
    const user = userEvent.setup()
    open({})
    await user.click(screen.getByRole('button', { name: 'Ya verifiqué mi correo' }))
    expect(await screen.findByText(/Todavía no figura como verificado/)).toBeInTheDocument()
    expect(summaryButton()).toBeDisabled()
  })

  it('al verificar, habilita el botón del resumen y retira el aviso', async () => {
    const user = userEvent.setup()
    const service = open({ refresh: vi.fn(() => Promise.resolve({ ok: true as const, verified: true })) })
    await user.click(screen.getByRole('button', { name: 'Ya verifiqué mi correo' }))
    await waitFor(() => expect(summaryButton()).toBeEnabled())
    expect(service.refresh).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Pedí el correo de verificación/)).not.toBeInTheDocument()
  })

  it('muestra el error al comprobar la verificación', async () => {
    const user = userEvent.setup()
    open({ refresh: vi.fn(() => Promise.resolve({ ok: false as const, message: 'No hay conexión.' })) })
    await user.click(screen.getByRole('button', { name: 'Ya verifiqué mi correo' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión.')
  })
})

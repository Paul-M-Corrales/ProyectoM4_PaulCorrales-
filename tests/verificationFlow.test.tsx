import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppRoutes } from '@/app/AppRoutes'
import { EmailVerificationContext } from '@/features/tasks/context/emailVerificationContext'
import { SummaryEmailContext } from '@/features/tasks/context/summaryEmailContext'
import { TaskRepositoryContext } from '@/features/tasks/context/taskRepositoryContext'
import type { EmailVerificationService } from '@/features/tasks/services/emailVerificationService'
import { fakeGateway, renderWithAuth, USER } from './auth/helpers'
import { fakeVerification } from './tasks/fakeVerification'
import { memoryRepository } from './tasks/memoryRepository'

/** Abre Mis tareas con una sesión de correo y contraseña (o de Google) según `verified`. */
function open(verified: boolean, verification: EmailVerificationService = fakeVerification(), path = '/tareas') {
  const send = vi.fn(() => Promise.resolve({ ok: true as const }))
  const gateway = fakeGateway()
  renderWithAuth(
    <SummaryEmailContext value={{ isEmailVerified: () => verified, send }}>
      <EmailVerificationContext value={verification}>
        <TaskRepositoryContext value={() => memoryRepository()}>
          <AppRoutes />
        </TaskRepositoryContext>
      </EmailVerificationContext>
    </SummaryEmailContext>,
    gateway,
    path,
  )
  act(() => gateway.emit(USER))
  return { send, verification }
}
const summary = () => screen.getByRole('button', { name: 'Enviar resumen por correo' })

beforeEach(() => sessionStorage.clear())

describe('verificación en Mis tareas tras registrarse con correo y contraseña', () => {
  it('muestra el aviso, envía el enlace y mantiene bloqueado el resumen', async () => {
    const { send, verification } = open(false)
    expect(await screen.findByRole('heading', { name: 'Verificá tu correo electrónico' })).toBeInTheDocument()
    expect(await screen.findByText(/carpetas de Spam o Correo no deseado/)).toBeInTheDocument()
    expect(verification.send).toHaveBeenCalledTimes(1)
    expect(summary()).toBeDisabled()
    await userEvent.setup().click(summary())
    expect(send).not.toHaveBeenCalled()
  })

  it('es visible justo después de registrarse, en la pantalla de inicio, y envía un solo enlace', async () => {
    const { verification } = open(false, fakeVerification(), '/inicio')
    expect(await screen.findByRole('heading', { name: 'Verificá tu correo electrónico' })).toBeInTheDocument()
    await screen.findByText(/Te enviamos un enlace/)
    await userEvent.setup().click(screen.getByRole('link', { name: 'Mis tareas' }))
    expect(await screen.findByRole('button', { name: 'Enviar resumen por correo' })).toBeDisabled()
    expect(screen.getAllByRole('heading', { name: 'Verificá tu correo electrónico' })).toHaveLength(1)
    expect(verification.send).toHaveBeenCalledTimes(1)
  })

  it('al confirmar la verificación retira el aviso, lo anuncia y habilita el resumen', async () => {
    const user = userEvent.setup()
    const verification = fakeVerification({ refresh: vi.fn(() => Promise.resolve({ ok: true as const, verified: true })) })
    open(false, verification)
    await user.click(await screen.findByRole('button', { name: 'Ya verifiqué mi correo' }))
    await waitFor(() => expect(summary()).toBeEnabled())
    expect(screen.queryByRole('heading', { name: 'Verificá tu correo electrónico' })).not.toBeInTheDocument()
    expect(screen.getByText(/Correo verificado\. Ya podés enviar/)).toBeInTheDocument()
  })

  it('con Google (cuenta ya verificada) no aparece el aviso ni se envía ningún enlace', async () => {
    const { verification } = open(true)
    expect(await screen.findByRole('heading', { name: /Mis tareas/ })).toBeInTheDocument()
    expect(screen.queryByText('Verificá tu correo electrónico')).not.toBeInTheDocument()
    expect(verification.send).not.toHaveBeenCalled()
    expect(summary()).toBeEnabled()
  })
})

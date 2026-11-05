import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryEmailAction } from '@/features/tasks/components/SummaryEmailAction'
import { SummaryEmailContext } from '@/features/tasks/context/summaryEmailContext'
import { createSummaryEmailService, type SummaryEmailService } from '@/features/tasks/services/summaryEmailService'

const open = (service: SummaryEmailService, locked = false) =>
  render(
    <SummaryEmailContext value={service}>
      <SummaryEmailAction locked={locked} />
    </SummaryEmailContext>,
  )
const button = () => screen.getByRole('button', { name: /resumen por correo|Enviando/ })

describe('Enviar resumen por correo', () => {
  it('muestra el botón, el estado enviando y que fue aceptado sin prometer la entrega', async () => {
    const user = userEvent.setup()
    let finish: (value: { ok: true }) => void = () => {}
    const send = vi.fn(() => new Promise<{ ok: true }>((resolve) => (finish = resolve)))
    open({ isEmailVerified: () => true, send })
    await user.click(button())
    expect(button()).toHaveTextContent('Enviando…')
    await act(async () => finish({ ok: true }))
    expect(await screen.findByRole('status')).toHaveTextContent(/Solicitud aceptada/)
    expect(screen.getByRole('status')).toHaveTextContent(/no garantizamos/)
  })

  it('evita el doble envío con clics repetidos', async () => {
    const user = userEvent.setup()
    const send = vi.fn(() => new Promise<{ ok: true }>(() => {}))
    open({ isEmailVerified: () => true, send })
    await user.dblClick(button())
    await user.click(button())
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('muestra el error devuelto por el servidor', async () => {
    const user = userEvent.setup()
    open({ isEmailVerified: () => true, send: () => Promise.resolve({ ok: false, message: 'Esperá un momento.' }) })
    await user.click(button())
    expect(await screen.findByRole('alert')).toHaveTextContent('Esperá un momento.')
  })

  it('bloqueado por falta de verificación queda deshabilitado y remite al aviso', async () => {
    const user = userEvent.setup()
    const send = vi.fn()
    open({ isEmailVerified: () => false, send }, true)
    expect(button()).toBeDisabled()
    expect(screen.getByText(/Verificá tu correo/)).toBeInTheDocument()
    await user.click(button())
    expect(send).not.toHaveBeenCalled()
  })
})

describe('servicio del navegador', () => {
  it('sin sesión ni configuración no llama a la red', async () => {
    const request = vi.fn()
    const result = await createSummaryEmailService({}, request as never).send()
    expect(result.ok).toBe(false)
    expect(request).not.toHaveBeenCalled()
  })
})

describe('secretos fuera del navegador', () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? files(path) : /\.(tsx?|css)$/.test(name) ? [path] : []
    })

  it('src no importa AWS SDK ni Firebase Admin ni lee claves del servidor', () => {
    const text = files('src').map((file) => readFileSync(file, 'utf8')).join('\n')
    expect(text).not.toMatch(/@aws-sdk|firebase-admin|AWS_SECRET|AWS_ACCESS|FIREBASE_PRIVATE_KEY|VITE_AWS|VITE_SES/)
  })

  it('.env.example no define variables VITE_ para AWS ni trae valores secretos', () => {
    const example = readFileSync('.env.example', 'utf8')
    expect(example).not.toMatch(/VITE_(AWS|SES)/)
    expect(example).not.toMatch(/^(AWS_SECRET_ACCESS_KEY|FIREBASE_PRIVATE_KEY|AWS_ACCESS_KEY_ID)=.+/m)
  })
})

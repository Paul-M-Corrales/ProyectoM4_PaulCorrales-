import { createSummaryEmailHandler } from '../../server/handler'
import { fakeDeps, ME, post } from './helpers'

const run = (request: Request, setup = fakeDeps()) =>
  createSummaryEmailHandler(setup.provider)(request).then(async (response) => ({
    response,
    body: (await response.json()) as Record<string, unknown>,
    ...setup,
  }))

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => vi.restoreAllMocks())

describe('POST /api/tasks/summary-email', () => {
  it.each(['GET', 'PUT', 'DELETE', 'PATCH'])('rechaza el método %s con 405', async (method) => {
    const { response, body, sent } = await run(new Request('https://app.test/api/tasks/summary-email', { method }))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
    expect(body.code).toBe('method_not_allowed')
    expect(sent).toEqual([])
  })

  it('rechaza sin token y con token inválido o vencido', async () => {
    const none = await run(post({ authorization: '' }))
    expect(none.response.status).toBe(401)
    const bad = await run(post({ authorization: 'Bearer expired' }))
    expect(bad.response.status).toBe(401)
    expect(bad.body.code).toBe('unauthorized')
    expect(bad.sent).toEqual([])
    expect(bad.deps.loadTasks).not.toHaveBeenCalled()
  })

  it('con token válido responde 202 y envía el resumen al correo verificado del token', async () => {
    const { response, body, sent } = await run(post())
    expect(response.status).toBe(202)
    expect(body).toEqual({ ok: true, status: 'accepted' })
    expect(sent).toHaveLength(1)
    expect(sent[0]).toMatchObject({ to: ME.email, subject: 'Tu resumen de tareas — On-going' })
    expect(sent[0]?.html).toContain('Estudiar')
  })

  it('el UID sale del token verificado y solo se consultan sus tareas', async () => {
    const { deps } = await run(post())
    expect(deps.verifyToken).toHaveBeenCalledWith('good')
    expect(deps.loadTasks).toHaveBeenCalledExactlyOnceWith(ME.uid)
    expect(deps.reserveSend).toHaveBeenCalledExactlyOnceWith(ME.uid)
  })

  it('ignora destinatario, uid o tareas enviados por el navegador (cuerpo, query y cabeceras)', async () => {
    const request = new Request('https://app.test/api/tasks/summary-email?uid=victima&to=spam@x.com', {
      method: 'POST',
      headers: { host: 'app.test', 'x-requested-with': 'ongoing-web', authorization: 'Bearer good', 'x-uid': 'victima' },
      body: JSON.stringify({ to: 'spam@x.com', uid: 'victima', tasks: [{ title: 'inyectada' }] }),
    })
    const { sent, deps } = await run(request)
    expect(sent.map((email) => email.to)).toEqual([ME.email])
    expect(sent[0]?.html).not.toContain('inyectada')
    expect(deps.loadTasks).toHaveBeenCalledWith(ME.uid)
  })

  it('bloquea cuentas sin correo verificado o sin correo', async () => {
    for (const user of [{ ...ME, emailVerified: false }, { ...ME, email: null }]) {
      const setup = fakeDeps({ verifyToken: vi.fn(() => Promise.resolve(user)) })
      const { response, body, sent } = await run(post(), setup)
      expect(response.status).toBe(403)
      expect(body.code).toBe('email_not_verified')
      expect(sent).toEqual([])
    }
  })

  it('exige la cabecera propia y un origen permitido', async () => {
    expect((await run(post({ 'x-requested-with': '' }))).response.status).toBe(403)
    expect((await run(post({ origin: 'https://evil.test' }))).response.status).toBe(403)
    expect((await run(post({ origin: 'https://app.test' }))).response.status).toBe(202)
    const allowed = fakeDeps({ allowedOrigins: ['https://otro.app'] })
    expect((await run(post({ origin: 'https://otro.app' }), allowed)).response.status).toBe(202)
  })

  it('aplica el límite de frecuencia con Retry-After y sin enviar', async () => {
    const setup = fakeDeps({ reserveSend: vi.fn(() => Promise.resolve({ allowed: false as const, retryAfterSeconds: 42 })) })
    const { response, body, sent, deps } = await run(post(), setup)
    expect(response.status).toBe(429)
    expect(response.headers.get('retry-after')).toBe('42')
    expect(body.code).toBe('rate_limited')
    expect(sent).toEqual([])
    expect(deps.loadTasks).not.toHaveBeenCalled()
  })

  it('un fallo de SES devuelve 502 genérico sin filtrar detalles internos', async () => {
    const secret = 'AccessDenied arn:aws:iam::123456789012:user/x'
    const setup = fakeDeps({ sender: { send: vi.fn(() => Promise.reject(new Error(secret))) } })
    const { response, body } = await run(post(), setup)
    expect(response.status).toBe(502)
    expect(JSON.stringify(body)).not.toContain('arn:aws')
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain('arn:aws')
  })

  it('un fallo de Firestore devuelve 500 genérico', async () => {
    const setup = fakeDeps({ loadTasks: vi.fn(() => Promise.reject(new Error('boom'))) })
    const { response, body } = await run(post(), setup)
    expect(response.status).toBe(500)
    expect(body.code).toBe('internal')
  })

  it('sin variables de entorno responde 503 y nunca llama a nada', async () => {
    const handler = createSummaryEmailHandler(() => ({ ok: false, missing: ['AWS_REGION'] }))
    const response = await handler(post())
    expect(response.status).toBe(503)
    expect(JSON.stringify(await response.json())).not.toContain('AWS_REGION')
  })
})

import { createSummaryEmailHandler } from '../../server/handler'
import { createRateLimiter } from '../../server/rateLimit'
import { fakeDeps, ME, post } from './helpers'

/** Firestore con transacciones serializadas, como las reales: dos reservas simultáneas no pueden colarse. */
function serializedDb() {
  let doc: Record<string, unknown> | undefined
  let queue: Promise<unknown> = Promise.resolve()
  return {
    collection: () => ({ doc: () => ({}) }),
    runTransaction: (fn: (tx: unknown) => Promise<unknown>) => {
      const run = queue.then(() =>
        fn({ get: () => Promise.resolve({ data: () => doc }), set: (_ref: unknown, value: Record<string, unknown>) => (doc = value) }),
      )
      queue = run.catch(() => undefined)
      return run
    },
  } as never
}

const withLimiter = (over: Parameters<typeof fakeDeps>[0] = {}) =>
  fakeDeps({ reserveSend: createRateLimiter(serializedDb()), ...over })

beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
afterEach(() => vi.restoreAllMocks())

describe('endurecimiento del endpoint', () => {
  it('solicitudes simultáneas del mismo usuario envían un solo correo', async () => {
    const setup = withLimiter()
    const handler = createSummaryEmailHandler(setup.provider)
    const responses = await Promise.all([handler(post()), handler(post()), handler(post()), handler(post())])
    expect(responses.map((response) => response.status).sort()).toEqual([202, 429, 429, 429])
    expect(setup.sent).toHaveLength(1)
  })

  it('decisión documentada: si SES falla la reserva se conserva y el reintento inmediato espera el enfriamiento', async () => {
    const setup = withLimiter({ sender: { send: vi.fn(() => Promise.reject(new Error('ses down'))) } })
    const handler = createSummaryEmailHandler(setup.provider)
    expect((await handler(post())).status).toBe(502)
    const retry = await handler(post())
    expect(retry.status).toBe(429)
    expect(Number(retry.headers.get('retry-after'))).toBeGreaterThan(0)
  })

  it('un fallo de Firebase Admin responde 401 genérico, no envía y deja el tipo de error en el log', async () => {
    const setup = withLimiter({ verifyToken: vi.fn(() => Promise.reject(new TypeError('private key PEM-SECRETO'))) })
    const response = await createSummaryEmailHandler(setup.provider)(post())
    expect(response.status).toBe(401)
    expect(JSON.stringify(await response.json())).not.toContain('PEM-SECRETO')
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).toContain('auth: TypeError')
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain('PEM-SECRETO')
    expect(setup.sent).toEqual([])
  })

  it('ni los logs ni las respuestas de error contienen el token ni el correo del usuario', async () => {
    const setup = withLimiter({
      sender: { send: vi.fn(() => Promise.reject(new Error(`falló para ${ME.email} con good`))) },
    })
    const response = await createSummaryEmailHandler(setup.provider)(post())
    const everything = JSON.stringify([await response.json(), vi.mocked(console.error).mock.calls])
    expect(everything).not.toContain(ME.email)
    expect(everything).not.toContain('Bearer')
    expect(everything).not.toContain('good')
  })

  it('un cuerpo enorme no se lee: sigue respondiendo y el destinatario sigue siendo el del token', async () => {
    const setup = withLimiter()
    const big = JSON.stringify({ to: 'otro@x.com', padding: 'x'.repeat(2_000_000) })
    const response = await createSummaryEmailHandler(setup.provider)(post({}, { body: big }))
    expect(response.status).toBe(202)
    expect(setup.sent.map((email) => email.to)).toEqual([ME.email])
  })

  it.each(['Bearer', 'Bearer  ', 'Basic abc', 'Bearer a b', 'bearer good'])('rechaza la cabecera malformada %j', async (header) => {
    const setup = withLimiter()
    const response = await createSummaryEmailHandler(setup.provider)(post({ authorization: header }))
    expect(response.status).toBe(401)
    expect(setup.sent).toEqual([])
  })
})

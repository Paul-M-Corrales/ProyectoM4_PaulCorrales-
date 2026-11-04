import { describeSesError } from '../../server/sesDiagnostics'
import { createSummaryEmailHandler } from '../../server/handler'
import { fakeDeps, ME, post } from './helpers'

const ACCOUNT = '123456789012'
const REQUEST_ID = '3f0c1a52-9b7e-4d1c-8a55-0e2f6c1d7a90'
const denied = (resource: string, over: Record<string, unknown> = {}) =>
  Object.assign(
    new Error(
      `User: arn:aws:iam::${ACCOUNT}:user/ongoing-ses-sender is not authorized to perform: ses:SendEmail on resource: ${resource} because no identity-based policy allows the ses:SendEmail action`,
    ),
    { name: 'AccessDeniedException', $fault: 'client', $metadata: { httpStatusCode: 403, requestId: REQUEST_ID, attempts: 1 } },
    over,
  )

describe('describeSesError', () => {
  it('extrae metadatos y motivo de una AccessDeniedException completa', () => {
    const line = describeSesError(denied(`arn:aws:ses:us-east-2:${ACCOUNT}:identity/${ME.email}`), ME.email)
    expect(line).toBe(
      `name=AccessDeniedException operation=SendEmail(sesv2) http=403 requestId=${REQUEST_ID} attempts=1 fault=client ` +
        'action=ses:SendEmail resourceType=identity resourceRegion=us-east-2 resourceRole=recipient reason=no-identity-policy-allow',
    )
  })

  it('distingue una identidad denegada que no es el destinatario', () => {
    const line = describeSesError(denied(`arn:aws:ses:us-east-2:${ACCOUNT}:identity/remitente@otro.com`), ME.email)
    expect(line).toContain('resourceRole=other-identity')
  })

  it('no lanza con nombres de recurso mal codificados', () => {
    const line = describeSesError(denied(`arn:aws:ses:us-east-2:${ACCOUNT}:identity/%25zz`), ME.email)
    expect(line).toContain('resourceRole=other-identity')
  })

  it('omite requestId ausente o con formato inesperado', () => {
    const none = denied('x', { $metadata: { httpStatusCode: 403 } })
    expect(describeSesError(none)).not.toContain('requestId')
    const odd = denied('x', { $metadata: { httpStatusCode: 403, requestId: 'a b;<script>' } })
    expect(describeSesError(odd)).not.toContain('requestId')
  })

  it('ignora mensajes desconocidos sin copiarlos', () => {
    const error = Object.assign(new Error('mensaje raro con texto libre'), { name: 'SomethingElse', $metadata: { httpStatusCode: 500 } })
    expect(describeSesError(error)).toBe('name=SomethingElse operation=SendEmail(sesv2) http=500')
  })

  it('no filtra identificadores sensibles', () => {
    const message = `AKIAABCDEFGHIJKLMNOP secret wJalrXUtnFEMI/K7MDENG token eyJhbGciOi ${ME.email} arn:aws:ses:us-east-2:${ACCOUNT}:identity/x`
    const error = Object.assign(new Error(message), { name: 'AccessDeniedException', $metadata: { httpStatusCode: 403 } })
    const line = describeSesError(denied(`arn:aws:ses:us-east-2:${ACCOUNT}:identity/${ME.email}`), ME.email) + describeSesError(error, ME.email)
    for (const secret of [ACCOUNT, 'AKIA', 'wJalr', 'eyJhb', ME.email, 'arn:', 'ongoing-ses-sender']) {
      expect(line).not.toContain(secret)
    }
  })

  it('un error no AWS solo aporta su nombre', () => {
    expect(describeSesError(new TypeError('boom'))).toBe('name=TypeError')
    expect(describeSesError('texto')).toBe('name=unknown')
    expect(describeSesError(Object.assign(new Error('x'), { name: 'mal nombre <b>' }))).toBe('name=unknown')
  })
})

describe('respuesta pública ante un AccessDenied de SES', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
  afterEach(() => vi.restoreAllMocks())

  it('registra el diagnóstico saneado pero devuelve un 502 genérico', async () => {
    const error = denied(`arn:aws:ses:us-east-2:${ACCOUNT}:identity/${ME.email}`)
    const setup = fakeDeps({ sender: { send: vi.fn(() => Promise.reject(error)) } })
    const response = await createSummaryEmailHandler(setup.provider)(post())
    const body = JSON.stringify(await response.json())
    expect(response.status).toBe(502)
    for (const leaked of [REQUEST_ID, ACCOUNT, 'AccessDenied', 'ses:SendEmail', 'identity']) expect(body).not.toContain(leaked)
    const logged = JSON.stringify(vi.mocked(console.error).mock.calls)
    expect(logged).toContain(`requestId=${REQUEST_ID}`)
    expect(logged).toContain('resourceRole=recipient')
    for (const leaked of [ACCOUNT, ME.email, 'arn:']) expect(logged).not.toContain(leaked)
  })
})

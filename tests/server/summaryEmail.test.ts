import { renderText } from '../../server/emailText'
import { renderHtml } from '../../server/emailTemplate'
import { readServerConfig } from '../../server/env'
import { escapeHtml, formatDate } from '../../server/escapeHtml'
import { COOLDOWN_SECONDS, createRateLimiter, DAILY_LIMIT } from '../../server/rateLimit'
import { createSesSender } from '../../server/ses'
import { MAX_LISTED } from '../../server/summary'
import { summarize } from './helpers'
import type { SummaryTask } from '../../server/types'

const task = (over: Partial<SummaryTask> = {}): SummaryTask => ({
  title: 'T', priority: 'media', dueDate: null, completed: false, ...over,
})

describe('buildSummary', () => {
  it('calcula totales, pendientes y porcentaje', () => {
    const s = summarize([task({ completed: true }), task({ completed: true }), task(), task()])
    expect(s).toMatchObject({ total: 4, completed: 2, pending: 2, percent: 50, hidden: 0 })
    expect(summarize([])).toMatchObject({ total: 0, percent: 0, listed: [] })
    expect(summarize([task({ completed: true })]).percent).toBe(100)
  })

  it('ordena por vencimiento y prioridad, y trunca la lista de forma explícita', () => {
    const many = Array.from({ length: MAX_LISTED + 5 }, (_, i) => task({ title: `t${i}` }))
    const s = summarize(many)
    expect(s.listed).toHaveLength(MAX_LISTED)
    expect(s.hidden).toBe(5)
    expect(renderHtml(s, null)).toContain('Mostrando 25 de 30 pendientes')
    expect(renderText(s, null)).toContain('5 no están incluidas')
    const [first] = summarize([task({ title: 'sin' }), task({ title: 'cerca', dueDate: '2030-01-01' })]).listed
    expect(first?.title).toBe('cerca')
  })
})

describe('plantilla', () => {
  it('escapa el HTML de tareas y del nombre (sin inyección)', () => {
    const evil = '<script>alert(1)</script><img src=x onerror=1>"\''
    const html = renderHtml(summarize([task({ title: evil })]), evil)
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;script&gt;')
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;')
  })

  it('incluye progreso, prioridades, fechas y mensaje de cierre, en HTML y texto', () => {
    const s = summarize([task({ title: 'Leer', priority: 'alta', dueDate: '2030-05-14' }), task({ completed: true })])
    const html = renderHtml(s, 'Ana')
    const text = renderText(s, 'Ana')
    for (const out of [html, text]) {
      expect(out).toContain('Hola, Ana')
      expect(out).toContain('50%')
      expect(out).toContain('Leer')
      expect(out).toContain('14/05/2030')
    }
    expect(html).toContain('Prioridad Alta')
    expect(text).toContain('prioridad alta')
    expect(formatDate('no-fecha')).toBeNull()
  })
})

describe('configuración del servidor', () => {
  const full = {
    AWS_REGION: 'us-east-1', SES_FROM_EMAIL: 'a@b.com', FIREBASE_PROJECT_ID: 'p',
    FIREBASE_CLIENT_EMAIL: 'x@p.iam', FIREBASE_PRIVATE_KEY: 'a\\nb',
  }

  it('informa solo los nombres de las variables ausentes', () => {
    expect(readServerConfig({})).toMatchObject({ ok: false, missing: expect.arrayContaining(['AWS_REGION', 'AWS_SES_FROM_EMAIL']) })
    expect(readServerConfig({ ...full, AWS_ACCESS_KEY_ID: 'k' })).toMatchObject({ ok: false, missing: ['AWS_SECRET_ACCESS_KEY'] })
  })

  it('acepta la cadena estándar de credenciales y normaliza la clave privada', () => {
    const result = readServerConfig(full)
    expect(result.ok && result.config.awsCredentials).toBeNull()
    expect(result.ok && result.config.firebase.privateKey).toBe('a\nb')
  })
})

describe('adaptador SES', () => {
  it('envía con remitente fijo y un único destinatario', async () => {
    const config = readServerConfig({
      AWS_REGION: 'r', SES_FROM_EMAIL: 'from@b.com', FIREBASE_PROJECT_ID: 'p', FIREBASE_CLIENT_EMAIL: 'c', FIREBASE_PRIVATE_KEY: 'k',
    })
    if (!config.ok) throw new Error('config')
    const send = vi.fn(() => Promise.resolve({}))
    await createSesSender(config.config, { send } as never).send({ to: 'u@x.com', subject: 's', html: 'h', text: 't' })
    const [command] = send.mock.calls[0] as unknown as [{ input: { FromEmailAddress: string; Destination: unknown } }]
    expect(command.input.FromEmailAddress).toBe('from@b.com')
    expect(command.input.Destination).toEqual({ ToAddresses: ['u@x.com'] })
  })
})

describe('límite de frecuencia persistente', () => {
  function fakeDb() {
    let doc: Record<string, unknown> | undefined
    const ref = {}
    const db = {
      collection: () => ({ doc: () => ref }),
      runTransaction: (fn: (tx: unknown) => Promise<unknown>) =>
        fn({ get: () => Promise.resolve({ data: () => doc }), set: (_r: unknown, value: Record<string, unknown>) => (doc = value) }),
    }
    return db as never
  }

  it('permite el primero, bloquea durante el enfriamiento y luego el tope diario', async () => {
    let now = Date.parse('2030-01-01T10:00:00Z')
    const reserve = createRateLimiter(fakeDb(), () => now)
    expect(await reserve('u')).toEqual({ allowed: true })
    expect(await reserve('u')).toEqual({ allowed: false, retryAfterSeconds: COOLDOWN_SECONDS })
    for (let i = 1; i < DAILY_LIMIT; i++) {
      now += (COOLDOWN_SECONDS + 1) * 1000
      expect(await reserve('u')).toEqual({ allowed: true })
    }
    now += (COOLDOWN_SECONDS + 1) * 1000
    expect(await reserve('u')).toMatchObject({ allowed: false })
    now = Date.parse('2030-01-02T00:05:00Z')
    expect(await reserve('u')).toEqual({ allowed: true })
  })
})

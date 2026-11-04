import { createSummaryEmailHandler } from '../../server/handler'
import { createTasksLoader } from '../../server/tasksSource'
import { fakeFirestore } from './fakeFirestore'
import { fakeDeps, post } from './helpers'
import type { VerifiedToken } from '../../server/types'

const A: VerifiedToken = { uid: 'uidA', email: 'a@dominio.com', emailVerified: true, name: 'Ana' }
const B: VerifiedToken = { uid: 'uidB', email: 'b@dominio.com', emailVerified: true, name: 'Beto' }
const task = (title: string, completed = false) => ({ title, priority: 'media', dueDate: null, completed })

function setup() {
  const { db, calls } = fakeFirestore({
    'users/uidA/tasks': [task('Tarea de Ana'), task('Hecha de Ana', true)],
    'users/uidB/tasks': [task('SECRETO de Beto'), task('SECRETO 2'), task('SECRETO 3')],
  })
  const tokens: Record<string, VerifiedToken> = { tokenA: A, tokenB: B }
  const base = fakeDeps({
    verifyToken: (token) => (tokens[token] ? Promise.resolve(tokens[token]) : Promise.reject(new Error('bad'))),
    loadTasks: createTasksLoader(db),
  })
  return { ...base, calls, handler: createSummaryEmailHandler(base.provider) }
}

const onlyPaths = (calls: string[], expected: string) =>
  expect(calls.every((call) => call.includes(` ${expected}`))).toBe(true)

describe('aislamiento entre usuarios (A y B)', () => {
  it('A solo consulta users/uidA/tasks, con contadores propios, y su correo no contiene datos de B', async () => {
    const { handler, calls, sent } = setup()
    expect((await handler(post({ authorization: 'Bearer tokenA' }))).status).toBe(202)
    expect(calls.length).toBeGreaterThan(0)
    onlyPaths(calls, 'users/uidA/tasks')
    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toBe('a@dominio.com')
    const content = `${sent[0]?.html}${sent[0]?.text}`
    expect(content).toContain('Tarea de Ana')
    expect(content).toContain('Total: 2 | Completadas: 1 | Pendientes: 1')
    expect(content).not.toContain('SECRETO')
  })

  it('A no cambia de usuario con uid en query, cabeceras ni cuerpo', async () => {
    const { handler, calls, sent } = setup()
    const request = new Request('https://app.test/api/tasks/summary-email?uid=uidB&userId=uidB', {
      method: 'POST',
      headers: { host: 'app.test', 'x-requested-with': 'ongoing-web', authorization: 'Bearer tokenA', 'x-uid': 'uidB' },
      body: JSON.stringify({ uid: 'uidB', path: 'users/uidB/tasks' }),
    })
    await handler(request)
    onlyPaths(calls, 'users/uidA/tasks')
    expect(sent[0]?.html).not.toContain('SECRETO')
  })

  it('B recibe solo lo suyo, en su propio correo', async () => {
    const { handler, calls, sent } = setup()
    await handler(post({ authorization: 'Bearer tokenB' }))
    onlyPaths(calls, 'users/uidB/tasks')
    expect(sent[0]?.to).toBe('b@dominio.com')
    expect(sent[0]?.html).toContain('SECRETO de Beto')
    expect(sent[0]?.html).not.toContain('Tarea de Ana')
  })

  it('un token inválido no consulta Firestore', async () => {
    const { handler, calls } = setup()
    expect((await handler(post({ authorization: 'Bearer forjado' }))).status).toBe(401)
    expect(calls).toEqual([])
  })
})

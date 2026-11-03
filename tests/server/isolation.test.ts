import { createSummaryEmailHandler } from '../../server/handler'
import { createTasksLoader } from '../../server/tasksSource'
import { fakeDeps, post } from './helpers'
import type { Firestore } from 'firebase-admin/firestore'
import type { VerifiedToken } from '../../server/types'

const A: VerifiedToken = { uid: 'uidA', email: 'a@dominio.com', emailVerified: true, name: 'Ana' }
const B: VerifiedToken = { uid: 'uidB', email: 'b@dominio.com', emailVerified: true, name: 'Beto' }
const DATA: Record<string, { title: string }[]> = {
  uidA: [{ title: 'Tarea de Ana' }],
  uidB: [{ title: 'SECRETO de Beto' }],
}

/** Firestore simulado: registra la ruta exacta consultada y solo responde con los datos de ese uid. */
function fakeDb() {
  const paths: string[] = []
  const db = {
    collection: (root: string) => ({
      doc: (uid: string) => ({
        collection: (leaf: string) => ({
          limit: () => ({
            get: () => {
              paths.push(`${root}/${uid}/${leaf}`)
              const docs = (DATA[uid] ?? []).map((data) => ({ data: () => data }))
              return Promise.resolve({ docs, size: docs.length })
            },
          }),
        }),
      }),
    }),
  } as unknown as Firestore
  return { db, paths }
}

function setup() {
  const { db, paths } = fakeDb()
  const tokens: Record<string, VerifiedToken> = { tokenA: A, tokenB: B }
  const base = fakeDeps({
    verifyToken: (token) => (tokens[token] ? Promise.resolve(tokens[token]) : Promise.reject(new Error('bad'))),
    loadTasks: createTasksLoader(db),
  })
  return { ...base, paths, handler: createSummaryEmailHandler(base.provider) }
}

describe('aislamiento entre usuarios (A y B)', () => {
  it('A solo consulta users/uidA/tasks y su correo no contiene tareas de B', async () => {
    const { handler, paths, sent } = setup()
    expect((await handler(post({ authorization: 'Bearer tokenA' }))).status).toBe(202)
    expect(paths).toEqual(['users/uidA/tasks'])
    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toBe('a@dominio.com')
    const content = `${sent[0]?.html}${sent[0]?.text}`
    expect(content).toContain('Tarea de Ana')
    expect(content).not.toContain('SECRETO')
  })

  it('A no cambia de usuario con uid en query, cabeceras ni cuerpo', async () => {
    const { handler, paths, sent } = setup()
    const request = new Request('https://app.test/api/tasks/summary-email?uid=uidB&userId=uidB', {
      method: 'POST',
      headers: { host: 'app.test', 'x-requested-with': 'ongoing-web', authorization: 'Bearer tokenA', 'x-uid': 'uidB' },
      body: JSON.stringify({ uid: 'uidB', path: 'users/uidB/tasks' }),
    })
    await handler(request)
    expect(paths).toEqual(['users/uidA/tasks'])
    expect(sent[0]?.html).not.toContain('SECRETO')
  })

  it('B recibe solo lo suyo, en su propio correo', async () => {
    const { handler, paths, sent } = setup()
    await handler(post({ authorization: 'Bearer tokenB' }))
    expect(paths).toEqual(['users/uidB/tasks'])
    expect(sent[0]?.to).toBe('b@dominio.com')
    expect(sent[0]?.html).toContain('SECRETO de Beto')
    expect(sent[0]?.html).not.toContain('Tarea de Ana')
  })

  it('un token inválido no consulta Firestore', async () => {
    const { handler, paths } = setup()
    expect((await handler(post({ authorization: 'Bearer forjado' }))).status).toBe(401)
    expect(paths).toEqual([])
  })
})

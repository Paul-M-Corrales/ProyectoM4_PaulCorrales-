import type { DepsResult } from '../../server/deps'
import type { Deps, SummaryTask, VerifiedToken } from '../../server/types'

export const ME: VerifiedToken = { uid: 'uid-real', email: 'ana@dominio.com', emailVerified: true, name: 'Ana' }

export const sampleTasks: SummaryTask[] = [
  { title: 'Estudiar', priority: 'alta', dueDate: '2030-05-14', completed: false },
  { title: 'Hecha', priority: 'baja', dueDate: null, completed: true },
]

export function fakeDeps(over: Partial<Deps> = {}) {
  const sent: { to: string; subject: string; html: string; text: string }[] = []
  const deps: Deps = {
    verifyToken: vi.fn((token: string) =>
      token === 'good' ? Promise.resolve(ME) : Promise.reject(new Error('invalid token')),
    ),
    loadTasks: vi.fn(() => Promise.resolve({ tasks: sampleTasks, partial: false })),
    reserveSend: vi.fn(() => Promise.resolve({ allowed: true as const })),
    sender: { send: vi.fn((email) => { sent.push(email); return Promise.resolve() }) },
    allowedOrigins: [],
    ...over,
  }
  const provider = (): DepsResult => ({ ok: true, deps })
  return { deps, sent, provider }
}

export function post(headers: Record<string, string> = {}, init: RequestInit = {}) {
  return new Request('https://app.test/api/tasks/summary-email', {
    method: 'POST',
    headers: { host: 'app.test', 'x-requested-with': 'ongoing-web', authorization: 'Bearer good', ...headers },
    ...init,
  })
}

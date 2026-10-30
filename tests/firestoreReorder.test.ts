import { writeBatch, type Firestore } from 'firebase/firestore'
import { createFirestoreTaskRepository } from '@/features/tasks/services/firestoreTaskRepository'

const batches: { update: ReturnType<typeof vi.fn>; commit: ReturnType<typeof vi.fn> }[] = []

vi.mock('firebase/firestore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/firestore')>()),
  collection: vi.fn((_db: unknown, ...path: string[]) => ({ path: path.join('/') })),
  doc: vi.fn((parent: { path: string }, id: string) => ({ path: `${parent.path}/${id}` })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  writeBatch: vi.fn(() => {
    const batch = { update: vi.fn(), commit: vi.fn(() => Promise.resolve()) }
    batches.push(batch)
    return batch
  }),
}))

const repo = (uid = 'userA') => createFirestoreTaskRepository({} as Firestore, uid)

beforeEach(() => {
  batches.length = 0
  vi.clearAllMocks()
})

describe('reorder en Firestore', () => {
  it('guarda solo order y updatedAt en un único lote atómico bajo la ruta del usuario', async () => {
    const result = await repo().reorder([{ id: 'a', order: 2 }, { id: 'b', order: 1 }])
    expect(result).toEqual({ ok: true })
    expect(batches).toHaveLength(1)
    expect(batches[0]!.update.mock.calls).toEqual([
      [{ path: 'users/userA/tasks/a' }, { order: 2, updatedAt: 'SERVER_TIMESTAMP' }],
      [{ path: 'users/userA/tasks/b' }, { order: 1, updatedAt: 'SERVER_TIMESTAMP' }],
    ])
    expect(batches[0]!.commit).toHaveBeenCalledOnce()
  })

  it('divide en lotes de 500 (límite de Firestore)', async () => {
    await repo().reorder(Array.from({ length: 501 }, (_, i) => ({ id: `t${i}`, order: i })))
    expect(vi.mocked(writeBatch)).toHaveBeenCalledTimes(2)
    expect(batches.map((b) => b.update.mock.calls.length)).toEqual([500, 1])
  })

  it('devuelve un mensaje legible si el lote falla y no anuncia éxito', async () => {
    vi.mocked(writeBatch).mockImplementationOnce((() => ({
      update: vi.fn(),
      commit: () => Promise.reject({ code: 'permission-denied' }),
    })) as unknown as typeof writeBatch)
    const result = await repo().reorder([{ id: 'a', order: 1 }])
    expect(result).toEqual({ ok: false, message: expect.stringMatching(/permiso/) })
  })
})

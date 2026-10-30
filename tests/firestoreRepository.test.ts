import { Timestamp, addDoc, deleteDoc, onSnapshot, updateDoc, type Firestore } from 'firebase/firestore'
import { createFirestoreTaskRepository } from '@/features/tasks/services/firestoreTaskRepository'
import { CONFIRM_TIMEOUT_MS, describeFirestoreError } from '@/features/tasks/services/firestoreErrors'
import type { TaskDraft } from '@/features/tasks/types'

vi.mock('firebase/firestore', async (importOriginal) => ({
  ...(await importOriginal<typeof import('firebase/firestore')>()),
  collection: vi.fn((_db: unknown, ...path: string[]) => ({ path: path.join('/') })),
  doc: vi.fn((parent: { path: string }, id: string) => ({ path: `${parent.path}/${id}` })),
  addDoc: vi.fn(() => Promise.resolve({})),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}))

const db = {} as Firestore
const draft: TaskDraft = { title: '  Estudiar  ', description: ' Reglas ', priority: 'alta', dueDate: '2026-05-14' }
const repo = (uid = 'userA') => createFirestoreTaskRepository(db, uid)

beforeEach(() => vi.clearAllMocks())

describe('repositorio de Firestore', () => {
  it('crea en users/{uid}/tasks con campos acotados, sin uid en el documento', async () => {
    expect(await repo().create(draft)).toEqual({ ok: true })
    const [target, data] = vi.mocked(addDoc).mock.calls[0] as unknown as [{ path: string }, Record<string, unknown>]
    expect(target.path).toBe('users/userA/tasks')
    expect(data).toMatchObject({
      title: 'Estudiar', description: 'Reglas', priority: 'alta', dueDate: '2026-05-14', completed: false,
      createdAt: 'SERVER_TIMESTAMP', updatedAt: 'SERVER_TIMESTAMP',
    })
    expect(Object.keys(data).sort()).toEqual(
      ['completed', 'createdAt', 'description', 'dueDate', 'order', 'priority', 'title', 'updatedAt'],
    )
  })

  it('el uid de la ruta sale de la sesión: otro usuario escribe en su propia colección', async () => {
    await repo('userB').create(draft)
    const [target] = vi.mocked(addDoc).mock.calls[0] as unknown as [{ path: string }]
    expect(target.path).toBe('users/userB/tasks')
  })

  it('no escribe si el borrador es inválido', async () => {
    const result = await repo().create({ ...draft, title: '   ' })
    expect(result.ok).toBe(false)
    expect(addDoc).not.toHaveBeenCalled()
    expect((await repo().update('t1', { title: 'x'.repeat(121) })).ok).toBe(false)
    expect(updateDoc).not.toHaveBeenCalled()
  })

  it('edita y completa con updatedAt del servidor', async () => {
    await repo().update('t1', { completed: true })
    const [target, data] = vi.mocked(updateDoc).mock.calls[0] as unknown as [{ path: string }, object]
    expect(target.path).toBe('users/userA/tasks/t1')
    expect(data).toEqual({ completed: true, updatedAt: 'SERVER_TIMESTAMP' })
  })

  it('elimina solo dentro de la colección del usuario', async () => {
    await repo().remove('t1')
    const [target] = vi.mocked(deleteDoc).mock.calls[0] as unknown as [{ path: string }]
    expect(target.path).toBe('users/userA/tasks/t1')
  })

  it('traduce errores de permisos y de conexión', async () => {
    vi.mocked(deleteDoc).mockRejectedValueOnce({ code: 'permission-denied' })
    const denied = await repo().remove('t1')
    expect(denied).toEqual({ ok: false, message: expect.stringMatching(/permiso/) })
    vi.mocked(updateDoc).mockRejectedValueOnce({ code: 'unavailable' })
    expect(await repo().update('t1', { completed: true })).toEqual({ ok: false, message: expect.stringMatching(/conexión/) })
    expect(describeFirestoreError(new Error('boom'))).not.toMatch(/boom/)
  })

  it('avisa si el servidor no confirma a tiempo (sin conexión)', async () => {
    vi.useFakeTimers()
    vi.mocked(addDoc).mockReturnValueOnce(new Promise(() => {}))
    const pending = repo().create(draft)
    await vi.advanceTimersByTimeAsync(CONFIRM_TIMEOUT_MS)
    expect(await pending).toEqual({ ok: false, message: expect.stringMatching(/confirmar/) })
    vi.useRealTimers()
  })

  it('suscribe con onSnapshot, mapea documentos y cancela el listener', () => {
    const unsubscribe = vi.fn()
    vi.mocked(onSnapshot).mockImplementation(((_q: unknown, next: (s: unknown) => void) => {
      const snapshot = {
        id: 't1',
        data: () => ({
          title: 'A', description: '', priority: 'baja', dueDate: null, completed: true, order: 5,
          createdAt: Timestamp.fromMillis(1000), updatedAt: Timestamp.fromMillis(2000),
        }),
      }
      next({ docs: [snapshot] })
      return unsubscribe
    }) as unknown as typeof onSnapshot)
    const onChange = vi.fn()
    const stop = repo().subscribe(onChange, vi.fn())
    expect(onChange).toHaveBeenCalledWith([
      { id: 't1', title: 'A', description: '', priority: 'baja', dueDate: null, completed: true, createdAt: 1000, order: 5 },
    ])
    stop()
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('reporta errores de la suscripción como mensaje legible', () => {
    vi.mocked(onSnapshot).mockImplementation(((_q: unknown, _next: unknown, error: (e: unknown) => void) => {
      error({ code: 'permission-denied' })
      return () => {}
    }) as unknown as typeof onSnapshot)
    const onError = vi.fn()
    repo().subscribe(vi.fn(), onError)
    expect(onError).toHaveBeenCalledWith(expect.stringMatching(/permiso/))
  })
})

import type { Firestore } from 'firebase-admin/firestore'

type Doc = Record<string, unknown>
type Filter = readonly [field: string, value: unknown]

export interface FakeOptions {
  /** Falla la agregación count() o la lectura de documentos. */
  readonly failOn?: 'count' | 'list'
}

/**
 * Firestore simulado (solo lo que usa el servidor): where '==', limit, count() y get().
 * Registra cada consulta con su ruta exacta para comprobar el aislamiento entre usuarios.
 */
export function fakeFirestore(data: Record<string, readonly Doc[]>, options: FakeOptions = {}) {
  const calls: string[] = []

  const query = (path: string, filters: readonly Filter[], max: number | null) => {
    const label = `${path}${filters.map(([f, v]) => ` ${f}==${String(v)}`).join('')}`
    const matching = () => (data[path] ?? []).filter((doc) => filters.every(([f, v]) => doc[f] === v))
    return {
      where: (field: string, _op: string, value: unknown) => query(path, [...filters, [field, value]], max),
      limit: (n: number) => query(path, filters, n),
      count: () => ({
        get: () => {
          calls.push(`count ${label}`)
          return options.failOn === 'count'
            ? Promise.reject(new Error('count failed'))
            : Promise.resolve({ data: () => ({ count: matching().length }) })
        },
      }),
      get: () => {
        calls.push(`list ${label}${max === null ? '' : ` limit ${max}`}`)
        if (options.failOn === 'list') return Promise.reject(new Error('list failed'))
        const docs = matching().slice(0, max ?? Infinity).map((doc) => ({ data: () => doc }))
        return Promise.resolve({ docs, size: docs.length })
      },
    }
  }

  const db = {
    collection: (root: string) => ({
      doc: (uid: string) => ({ collection: (leaf: string) => query(`${root}/${uid}/${leaf}`, [], null) }),
    }),
  } as unknown as Firestore
  return { db, calls }
}

/** n tareas del mismo estado, con títulos únicos. */
export const manyTasks = (n: number, completed: boolean, prefix = 'T'): Doc[] =>
  Array.from({ length: n }, (_, i) => ({
    title: `${prefix}${i}`, priority: 'media', dueDate: null, completed,
  }))

import type { Firestore, Query } from 'firebase-admin/firestore'
import type { Priority, SummaryTask, TasksSnapshot } from './types.js'

/** Pendientes que se traen del servidor para armar la lista del correo (consulta acotada, sin recorrer todo). */
export const LIST_POOL = 100
/** Mismo tope que las reglas de Firestore: protege el tamaño del correo frente a documentos antiguos. */
export const MAX_TITLE = 120

const isPriority = (value: unknown): value is Priority => value === 'alta' || value === 'media' || value === 'baja'

const count = async (query: Query) => (await query.count().get()).data().count

function toTask(data: Record<string, unknown>): SummaryTask {
  return {
    title: typeof data.title === 'string' ? data.title.slice(0, MAX_TITLE) : '',
    priority: isPriority(data.priority) ? data.priority : 'media',
    dueDate: typeof data.dueDate === 'string' ? data.dueDate : null,
    completed: false,
  }
}

/**
 * Lee EXCLUSIVAMENTE users/{uid}/tasks, con el uid verificado por el token.
 * Los contadores salen de agregaciones count() del servidor (exactas, sin tope de 500 ni lectura de documentos).
 * Solo la lista del correo lee documentos: pendientes, máximo LIST_POOL. Cualquier fallo se propaga
 * (nunca se envía un correo con cifras parciales).
 */
export function createTasksLoader(db: Firestore) {
  return async (uid: string): Promise<TasksSnapshot> => {
    const tasks = db.collection('users').doc(uid).collection('tasks')
    const pendingQuery = tasks.where('completed', '==', false)
    const [total, completed, pending, pool] = await Promise.all([
      count(tasks),
      count(tasks.where('completed', '==', true)),
      count(pendingQuery),
      pendingQuery.limit(LIST_POOL).get(),
    ])
    return {
      total: Math.max(total, completed + pending),
      completed,
      pending,
      // Documentos sin un `completed` booleano (datos antiguos): no se cuentan ni como hechos ni como pendientes.
      unknown: Math.max(0, total - completed - pending),
      candidates: pool.docs.map((doc) => toTask(doc.data())),
    }
  }
}

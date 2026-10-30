import type { Firestore } from 'firebase-admin/firestore'
import type { Priority, SummaryTask } from './types.js'

export const TASK_LIMIT = 500

const isPriority = (value: unknown): value is Priority => value === 'alta' || value === 'media' || value === 'baja'

/** Lee EXCLUSIVAMENTE users/{uid}/tasks, con el uid verificado por el token. */
export function createTasksLoader(db: Firestore) {
  return async (uid: string) => {
    const snapshot = await db.collection('users').doc(uid).collection('tasks').limit(TASK_LIMIT).get()
    const tasks: SummaryTask[] = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        title: typeof data.title === 'string' ? data.title : '',
        priority: isPriority(data.priority) ? data.priority : 'media',
        dueDate: typeof data.dueDate === 'string' ? data.dueDate : null,
        completed: data.completed === true,
      }
    })
    return { tasks, partial: snapshot.size >= TASK_LIMIT }
  }
}

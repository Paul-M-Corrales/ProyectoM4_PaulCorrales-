import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore'
import { PRIORITIES, type Priority, type Task, type TaskDraft } from '../types'

const isPriority = (value: unknown): value is Priority => PRIORITIES.includes(value as Priority)

function millis(value: unknown): number {
  return value instanceof Timestamp ? value.toMillis() : 0
}

/**
 * Convierte un documento en Task. Lee los timestamps pendientes con el estimado local
 * (`serverTimestamps: 'estimate'`) para que la tarea recién creada aparezca ya ordenada.
 */
export function taskFromDoc(snapshot: QueryDocumentSnapshot): Task {
  const data: DocumentData = snapshot.data({ serverTimestamps: 'estimate' })
  return {
    id: snapshot.id,
    title: typeof data.title === 'string' ? data.title : '',
    description: typeof data.description === 'string' ? data.description : '',
    priority: isPriority(data.priority) ? data.priority : 'media',
    dueDate: typeof data.dueDate === 'string' ? data.dueDate : null,
    completed: data.completed === true,
    createdAt: millis(data.createdAt),
    order: typeof data.order === 'number' ? data.order : 0,
  }
}

/** Campos editables normalizados (sin espacios sobrantes); nunca incluyen el uid ni la fecha de creación. */
export function draftData(draft: TaskDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    priority: draft.priority,
    dueDate: draft.dueDate,
  }
}

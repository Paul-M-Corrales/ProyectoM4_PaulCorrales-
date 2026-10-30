import {
  addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc, writeBatch, type Firestore,
} from 'firebase/firestore'
import { validateChanges, validateDraft } from '../logic/validateDraft'
import type { TaskActionResult, TaskChanges, TaskDraft } from '../types'
import { confirmed, describeFirestoreError } from './firestoreErrors'
import { draftData, taskFromDoc } from './taskMapper'
import type { TaskRepository } from './taskRepository'

const BATCH_LIMIT = 500
const INVALID: TaskActionResult = { ok: false, message: 'Revisá los datos de la tarea.' }

/**
 * Repositorio sobre `users/{uid}/tasks`. El uid sale de la sesión autenticada (nunca de un formulario)
 * y las reglas de seguridad vuelven a exigirlo en el servidor.
 */
export function createFirestoreTaskRepository(db: Firestore, uid: string): TaskRepository {
  const tasks = collection(db, 'users', uid, 'tasks')

  return {
    connected: true,
    subscribe(onChange, onError) {
      return onSnapshot(
        tasks,
        (snapshot) => onChange(snapshot.docs.map(taskFromDoc)),
        (error) => onError(describeFirestoreError(error)),
      )
    },
    create(draft: TaskDraft) {
      if (Object.keys(validateDraft(draft)).length > 0) return Promise.resolve(INVALID)
      const now = Date.now()
      return confirmed(() =>
        addDoc(tasks, {
          ...draftData(draft),
          completed: false,
          order: now,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      )
    },
    update(id: string, changes: TaskChanges) {
      if (Object.keys(validateChanges(changes)).length > 0) return Promise.resolve(INVALID)
      const { title, description, ...rest } = changes
      const data = {
        ...rest,
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        updatedAt: serverTimestamp(),
      }
      return confirmed(() => updateDoc(doc(tasks, id), data))
    },
    reorder(orders) {
      // Un lote admite 500 operaciones y es atómico: dentro de él el orden nunca queda a medias.
      const chunks = Array.from({ length: Math.ceil(orders.length / BATCH_LIMIT) }, (_, i) =>
        orders.slice(i * BATCH_LIMIT, (i + 1) * BATCH_LIMIT),
      )
      return confirmed(async () => {
        for (const chunk of chunks) {
          const batch = writeBatch(db)
          for (const { id, order } of chunk) batch.update(doc(tasks, id), { order, updatedAt: serverTimestamp() })
          await batch.commit()
        }
      })
    },
    remove(id: string) {
      return confirmed(() => deleteDoc(doc(tasks, id)))
    },
  }
}

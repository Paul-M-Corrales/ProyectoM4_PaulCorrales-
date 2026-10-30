import { getFirebaseDb } from '@/lib/firebase/client'
import { readFirebaseConfig } from '@/lib/firebase/config'
import { createFirestoreTaskRepository } from './firestoreTaskRepository'
import { unconnectedTaskRepository, type TaskRepository } from './taskRepository'

type Env = Readonly<Record<string, unknown>>

/** Repositorio real si hay sesión y configuración de Firebase; si no, el honesto sin conexión. */
export function createTaskRepository(uid: string | null, env: Env = import.meta.env): TaskRepository {
  if (uid === null) return unconnectedTaskRepository
  const result = readFirebaseConfig(env)
  if (!result.ok) return unconnectedTaskRepository
  return createFirestoreTaskRepository(getFirebaseDb(result.config), uid)
}

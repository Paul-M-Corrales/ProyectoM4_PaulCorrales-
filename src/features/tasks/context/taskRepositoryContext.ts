import { createContext } from 'react'
import { createTaskRepository } from '../services/createTaskRepository'
import type { TaskRepository } from '../services/taskRepository'

export type TaskRepositoryFactory = (uid: string | null) => TaskRepository

/** Los tests inyectan aquí un repositorio de mentira; la app usa Firestore. */
export const TaskRepositoryContext = createContext<TaskRepositoryFactory>((uid) => createTaskRepository(uid))

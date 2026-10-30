import { act } from '@testing-library/react'
import { AppRoutes } from '@/app/AppRoutes'
import { TaskRepositoryContext } from '@/features/tasks/context/taskRepositoryContext'
import { fakeGateway, renderWithAuth, USER } from '../auth/helpers'
import type { MemoryRepository } from './memoryRepository'

/** Abre Mis tareas con un usuario autenticado y el repositorio dado. */
export function openTasks(repository: MemoryRepository) {
  const gateway = fakeGateway()
  renderWithAuth(
    <TaskRepositoryContext value={() => repository}>
      <AppRoutes />
    </TaskRepositoryContext>,
    gateway,
    '/tareas',
  )
  act(() => gateway.emit(USER))
  return gateway
}

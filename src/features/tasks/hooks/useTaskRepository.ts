import { useContext, useMemo } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { TaskRepositoryContext } from '../context/taskRepositoryContext'

/** Repositorio del usuario autenticado: se recrea (y se cancelan sus listeners) al cambiar el uid. */
export function useTaskRepository() {
  const { session } = useAuth()
  const factory = useContext(TaskRepositoryContext)
  const uid = session.status === 'authenticated' ? session.user.uid : null
  const repository = useMemo(() => factory(uid), [factory, uid])
  return { repository, uid }
}

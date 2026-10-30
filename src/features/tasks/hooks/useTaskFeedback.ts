import { useCallback, useState } from 'react'
import type { TaskActionResult } from '../types'

export interface Feedback {
  readonly kind: 'ok' | 'error'
  readonly message: string
}

/** Resultado visible de la última operación pequeña (completar, eliminar) sin bloquear la interfaz. */
export function useTaskFeedback() {
  const [feedback, setFeedback] = useState<Feedback | undefined>()

  const run = useCallback(async (action: Promise<TaskActionResult>, okMessage: string) => {
    setFeedback(undefined)
    const result = await action
    setFeedback(result.ok ? { kind: 'ok', message: okMessage } : { kind: 'error', message: result.message })
  }, [])

  const clear = useCallback(() => setFeedback(undefined), [])

  return { feedback, run, clear }
}

import { useCallback, useRef, useState } from 'react'
import type { AuthAction, AuthResult, FormStatus } from '../types'
import { FALLBACK_ERROR, resultToStatus } from '../utils/authStatus'

/** Estado loading/success/error de una operación; ignora un segundo envío mientras hay una pendiente. */
export function useAuthRequest() {
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })
  const pending = useRef(false)

  const perform = useCallback(async (action: AuthAction, call: () => Promise<AuthResult>) => {
    if (pending.current) return
    pending.current = true
    setStatus({ kind: 'loading', action })
    try {
      setStatus(resultToStatus(await call()))
    } catch {
      setStatus({ kind: 'error', message: FALLBACK_ERROR })
    } finally {
      pending.current = false
    }
  }, [])

  return { status, setStatus, perform }
}

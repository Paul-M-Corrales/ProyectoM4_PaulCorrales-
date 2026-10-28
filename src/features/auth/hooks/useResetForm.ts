import { useCallback, useState } from 'react'
import type { AuthGateway } from '../types'
import { validateEmail } from '../validation/loginValidation'
import { useAuthRequest } from './useAuthRequest'

export function useResetForm(gateway: AuthGateway) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [invalidTick, setInvalidTick] = useState(0)
  const { status, setStatus, perform } = useAuthRequest()

  const change = useCallback((value: string) => {
    setEmail(value)
    setError(undefined)
  }, [])

  const submit = useCallback(async () => {
    if (status.kind === 'loading') return
    const found = validateEmail(email)
    setError(found)
    if (found) {
      setStatus({ kind: 'idle' })
      setInvalidTick((tick) => tick + 1)
      return
    }
    await perform('reset', () => gateway.requestPasswordReset(email.trim()))
  }, [email, gateway, perform, setStatus, status.kind])

  return { email, error, status, invalidTick, change, submit }
}

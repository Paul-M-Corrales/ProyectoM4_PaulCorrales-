import { useCallback, useState } from 'react'
import type { AuthAction, AuthGateway, AuthResult, FieldErrors, FormStatus } from '../types'
import { validateForAction } from '../validation/loginValidation'

const FALLBACK_ERROR = 'No pudimos completar la acción. Intentá de nuevo.'

function toStatus(result: AuthResult): FormStatus {
  if (result.ok) return { kind: 'idle' }
  const kind = result.code === 'integration-pending' ? 'notice' : 'error'
  return { kind, message: result.message }
}

export function useLoginForm(gateway: AuthGateway) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })
  const [invalidTick, setInvalidTick] = useState(0)

  const setField = useCallback((field: 'email' | 'password', value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }, [])

  const run = useCallback(
    async (action: AuthAction) => {
      if (status.kind === 'loading') return
      const found = validateForAction(values, action)
      setErrors(found)
      if (Object.keys(found).length > 0) {
        setStatus({ kind: 'idle' })
        setInvalidTick((tick) => tick + 1)
        return
      }
      setStatus({ kind: 'loading', action })
      try {
        const calls: Record<AuthAction, () => Promise<AuthResult>> = {
          'sign-in': () => gateway.signInWithEmail(values.email.trim(), values.password),
          google: () => gateway.signInWithGoogle(),
          'sign-up': () => gateway.signUpWithEmail(values.email.trim(), values.password),
          reset: () => gateway.requestPasswordReset(values.email.trim()),
        }
        setStatus(toStatus(await calls[action]()))
      } catch {
        setStatus({ kind: 'error', message: FALLBACK_ERROR })
      }
    },
    [gateway, status.kind, values],
  )

  return { values, errors, status, invalidTick, setField, run }
}

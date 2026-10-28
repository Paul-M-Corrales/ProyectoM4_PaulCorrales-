import { useCallback, useState } from 'react'
import type { AuthGateway, FieldErrors } from '../types'
import { validateForAction } from '../validation/loginValidation'
import { useAuthRequest } from './useAuthRequest'

type LoginAction = 'sign-in' | 'google'

export function useLoginForm(gateway: AuthGateway) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [invalidTick, setInvalidTick] = useState(0)
  const { status, setStatus, perform } = useAuthRequest()

  const setField = useCallback((field: 'email' | 'password', value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }, [])

  const run = useCallback(
    async (action: LoginAction) => {
      if (status.kind === 'loading') return
      const found = validateForAction(values, action)
      setErrors(found)
      if (Object.keys(found).length > 0) {
        setStatus({ kind: 'idle' })
        setInvalidTick((tick) => tick + 1)
        return
      }
      const email = values.email.trim()
      await perform(action, () =>
        action === 'google'
          ? gateway.signInWithGoogle()
          : gateway.signInWithEmail(email, values.password),
      )
    },
    [gateway, perform, setStatus, status.kind, values],
  )

  return { values, errors, status, invalidTick, setField, run }
}

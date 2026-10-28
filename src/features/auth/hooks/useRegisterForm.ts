import { useCallback, useState } from 'react'
import type { AuthGateway, FieldErrors, RegisterValues } from '../types'
import { validateRegistration } from '../validation/loginValidation'
import { useAuthRequest } from './useAuthRequest'

const EMPTY: RegisterValues = { email: '', password: '', confirmPassword: '' }

export function useRegisterForm(gateway: AuthGateway) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [invalidTick, setInvalidTick] = useState(0)
  const { status, setStatus, perform } = useAuthRequest()

  const setField = useCallback((field: keyof RegisterValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }, [])

  const submit = useCallback(async () => {
    if (status.kind === 'loading') return
    const found = validateRegistration(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      setStatus({ kind: 'idle' })
      setInvalidTick((tick) => tick + 1)
      return
    }
    await perform('sign-up', () => gateway.signUpWithEmail(values.email.trim(), values.password))
  }, [gateway, perform, setStatus, status.kind, values])

  const google = useCallback(
    () => perform('google', () => gateway.signInWithGoogle()),
    [gateway, perform],
  )

  return { values, errors, status, invalidTick, setField, submit, google }
}

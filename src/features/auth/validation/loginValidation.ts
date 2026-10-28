import type { AuthAction, FieldErrors, LoginValues, RegisterValues } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const MIN_PASSWORD_LENGTH = 8

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Ingresá tu correo electrónico.'
  if (!EMAIL_PATTERN.test(email)) return 'Ingresá un correo válido, por ejemplo nombre@dominio.com.'
  return undefined
}

export function validatePassword(value: string, requireMinLength: boolean): string | undefined {
  if (!value) return 'Ingresá tu contraseña.'
  if (requireMinLength && value.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  return undefined
}

/** Valida solo los campos que necesita cada acción. */
export function validateForAction(values: LoginValues, action: AuthAction): FieldErrors {
  const errors: FieldErrors = {}
  if (action === 'google') return errors
  const email = validateEmail(values.email)
  if (email) errors.email = email
  if (action === 'reset') return errors
  const password = validatePassword(values.password, action === 'sign-up')
  if (password) errors.password = password
  return errors
}

/** Registro: correo válido, contraseña con largo mínimo y confirmación idéntica. */
export function validateRegistration(values: RegisterValues): FieldErrors {
  const errors = validateForAction(values, 'sign-up')
  if (!values.confirmPassword) errors.confirmPassword = 'Repetí tu contraseña.'
  else if (!errors.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }
  return errors
}

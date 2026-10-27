import {
  validateEmail,
  validateForAction,
  validatePassword,
} from '@/features/auth/validation/loginValidation'

describe('validación del login', () => {
  it('valida el correo', () => {
    expect(validateEmail('')).toMatch(/Ingresá/)
    expect(validateEmail('sin-arroba')).toMatch(/válido/)
    expect(validateEmail('  yo@dominio.com ')).toBeUndefined()
  })

  it('exige longitud mínima solo al crear cuenta', () => {
    expect(validatePassword('corta', false)).toBeUndefined()
    expect(validatePassword('corta', true)).toMatch(/8 caracteres/)
    expect(validatePassword('', false)).toMatch(/Ingresá/)
  })

  it('valida únicamente los campos de cada acción', () => {
    const empty = { email: '', password: '' }
    expect(Object.keys(validateForAction(empty, 'sign-in')).sort()).toEqual(['email', 'password'])
    expect(Object.keys(validateForAction(empty, 'reset'))).toEqual(['email'])
    expect(validateForAction(empty, 'google')).toEqual({})
  })
})

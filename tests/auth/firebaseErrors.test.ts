import { safeRedirectPath } from '@/features/auth/utils/authStatus'
import { toAuthFailure } from '@/features/auth/utils/firebaseErrors'

const code = (c: string) => ({ code: c })

describe('traducción de errores de Firebase', () => {
  it.each(['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'])(
    '%s se muestra igual para no revelar si el correo existe',
    (c) => {
      expect(toAuthFailure(code(c), 'sign-in')).toMatchObject({
        code: 'invalid-credentials',
        message: 'El correo o la contraseña no son correctos.',
      })
    },
  )

  it('correo ya registrado: mensaje genérico sin confirmar la existencia de la cuenta', () => {
    const failure = toAuthFailure(code('auth/email-already-in-use'), 'sign-up')
    expect(failure.message).toMatch(/No pudimos crear la cuenta/)
    expect(failure.message).not.toMatch(/ya está registrado|en uso/i)
  })

  it('red, límite de intentos y contraseña débil tienen mensajes propios en español', () => {
    expect(toAuthFailure(code('auth/network-request-failed'), 'sign-in').code).toBe('network')
    expect(toAuthFailure(code('auth/too-many-requests'), 'sign-in').code).toBe('rate-limited')
    expect(toAuthFailure(code('auth/weak-password'), 'sign-up').message).toMatch(/débil/)
  })

  it('el popup de Google cerrado o cancelado se clasifica como cancelación', () => {
    expect(toAuthFailure(code('auth/popup-closed-by-user'), 'google').code).toBe('cancelled')
    expect(toAuthFailure(code('auth/cancelled-popup-request'), 'google').code).toBe('cancelled')
  })

  it('un error desconocido no filtra detalles internos', () => {
    const failure = toAuthFailure(new Error('stack con ana@dominio.com'), 'sign-in')
    expect(failure.code).toBe('unknown')
    expect(failure.message).not.toContain('ana@dominio.com')
  })
})

describe('safeRedirectPath', () => {
  it('acepta rutas privadas internas y rechaza el resto', () => {
    expect(safeRedirectPath('/tareas/detalle')).toBe('/tareas/detalle')
    expect(safeRedirectPath('//evil.com')).toBe('/inicio')
    expect(safeRedirectPath('https://evil.com')).toBe('/inicio')
    expect(safeRedirectPath('/')).toBe('/inicio')
    expect(safeRedirectPath('/registro')).toBe('/inicio')
    expect(safeRedirectPath(undefined)).toBe('/inicio')
  })
})

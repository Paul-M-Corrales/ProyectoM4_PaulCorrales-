import type { Auth } from 'firebase/auth'
import * as fb from 'firebase/auth'
import { createFirebaseAuthGateway } from '@/features/auth/services/firebaseAuthGateway'
import { RESET_NOTICE } from '@/features/auth/utils/firebaseErrors'

// Ninguna prueba contacta Firebase: todo el SDK de auth está simulado.
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: class {
    setCustomParameters = vi.fn()
  },
}))

const auth = { name: 'fake-auth' } as unknown as Auth
const gateway = createFirebaseAuthGateway(auth)
const fail = (code: string) => Object.assign(new Error('interno'), { code })

beforeEach(() => vi.resetAllMocks())

describe('gateway de Firebase (mocks)', () => {
  it('registro válido', async () => {
    vi.mocked(fb.createUserWithEmailAndPassword).mockResolvedValue({} as never)
    await expect(gateway.signUpWithEmail('ana@dominio.com', 'secreta123')).resolves.toEqual({ ok: true })
    expect(fb.createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'ana@dominio.com', 'secreta123')
  })

  it('registro rechazado por contraseña débil', async () => {
    vi.mocked(fb.createUserWithEmailAndPassword).mockRejectedValue(fail('auth/weak-password'))
    await expect(gateway.signUpWithEmail('ana@dominio.com', '123')).resolves.toMatchObject({
      ok: false,
      code: 'invalid-input',
    })
  })

  it('login exitoso y fallido', async () => {
    vi.mocked(fb.signInWithEmailAndPassword).mockResolvedValueOnce({} as never)
    await expect(gateway.signInWithEmail('ana@dominio.com', 'x')).resolves.toEqual({ ok: true })
    vi.mocked(fb.signInWithEmailAndPassword).mockRejectedValueOnce(fail('auth/invalid-credential'))
    await expect(gateway.signInWithEmail('ana@dominio.com', 'x')).resolves.toMatchObject({
      ok: false,
      code: 'invalid-credentials',
    })
  })

  it('Google: éxito y popup cancelado', async () => {
    vi.mocked(fb.signInWithPopup).mockResolvedValueOnce({} as never)
    await expect(gateway.signInWithGoogle()).resolves.toEqual({ ok: true })
    vi.mocked(fb.signInWithPopup).mockRejectedValueOnce(fail('auth/popup-closed-by-user'))
    await expect(gateway.signInWithGoogle()).resolves.toMatchObject({ ok: false, code: 'cancelled' })
  })

  it('recuperación: mismo resultado exista o no la cuenta', async () => {
    vi.mocked(fb.sendPasswordResetEmail).mockResolvedValueOnce(undefined)
    const existing = await gateway.requestPasswordReset('ana@dominio.com')
    vi.mocked(fb.sendPasswordResetEmail).mockRejectedValueOnce(fail('auth/user-not-found'))
    const unknown = await gateway.requestPasswordReset('nadie@dominio.com')
    expect(existing).toEqual({ ok: true, message: RESET_NOTICE })
    expect(unknown).toEqual(existing)
  })

  it('recuperación: los errores de red sí se informan', async () => {
    vi.mocked(fb.sendPasswordResetEmail).mockRejectedValueOnce(fail('auth/network-request-failed'))
    await expect(gateway.requestPasswordReset('ana@dominio.com')).resolves.toMatchObject({
      ok: false,
      code: 'network',
    })
  })

  it('logout llama a signOut del SDK', async () => {
    vi.mocked(fb.signOut).mockResolvedValue(undefined)
    await expect(gateway.signOut()).resolves.toEqual({ ok: true })
    expect(fb.signOut).toHaveBeenCalledWith(auth)
  })

  it('el observer entrega un usuario reducido y devuelve la función para desuscribirse', () => {
    const stop = vi.fn()
    vi.mocked(fb.onAuthStateChanged).mockImplementation(((_: unknown, next: (u: unknown) => void) => {
      next({ uid: 'u1', email: 'ana@dominio.com', displayName: 'Ana', stsTokenManager: 'secreto' })
      return stop
    }) as never)
    const received = vi.fn()
    const unsubscribe = gateway.onAuthChange(received)
    expect(received).toHaveBeenCalledWith({ uid: 'u1', email: 'ana@dominio.com', displayName: 'Ana' })
    unsubscribe()
    expect(stop).toHaveBeenCalled()
  })
})

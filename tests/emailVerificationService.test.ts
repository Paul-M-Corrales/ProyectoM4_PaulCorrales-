import { sendEmailVerification } from 'firebase/auth'
import { createEmailVerificationService } from '@/features/tasks/services/emailVerificationService'

const fakeUser = { emailVerified: false, reload: vi.fn(), getIdToken: vi.fn() }
let currentUser: typeof fakeUser | null = fakeUser

vi.mock('firebase/auth', () => ({ sendEmailVerification: vi.fn() }))
vi.mock('@/lib/firebase/client', () => ({ getFirebaseAuth: () => ({ get currentUser() { return currentUser } }) }))
vi.mock('@/lib/firebase/config', () => ({ readFirebaseConfig: () => ({ ok: true, config: {} }) }))

beforeEach(() => {
  currentUser = fakeUser
  fakeUser.emailVerified = false
  fakeUser.reload.mockReset().mockResolvedValue(undefined)
  fakeUser.getIdToken.mockReset().mockResolvedValue('token')
  vi.mocked(sendEmailVerification).mockReset().mockResolvedValue(undefined)
})

describe('servicio de verificación de correo', () => {
  it('usa sendEmailVerification de Firebase para el usuario actual', async () => {
    expect(await createEmailVerificationService({}).send()).toEqual({ ok: true })
    expect(sendEmailVerification).toHaveBeenCalledExactlyOnceWith(fakeUser)
  })

  it('traduce too-many-requests de Firebase sin exponer el error original', async () => {
    vi.mocked(sendEmailVerification).mockRejectedValue({ code: 'auth/too-many-requests', message: 'interno' })
    const result = await createEmailVerificationService({}).send()
    expect(result).toMatchObject({ ok: false, message: expect.stringContaining('demasiados') })
    expect(JSON.stringify(result)).not.toContain('interno')
  })

  it('al verificar recarga al usuario y renueva el ID token que lee el servidor', async () => {
    fakeUser.reload.mockImplementation(() => { fakeUser.emailVerified = true; return Promise.resolve() })
    expect(await createEmailVerificationService({}).refresh()).toEqual({ ok: true, verified: true })
    expect(fakeUser.getIdToken).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('si todavía no verificó no renueva el token', async () => {
    expect(await createEmailVerificationService({}).refresh()).toEqual({ ok: true, verified: false })
    expect(fakeUser.getIdToken).not.toHaveBeenCalled()
  })

  it('sin sesión no llama a Firebase', async () => {
    currentUser = null
    const service = createEmailVerificationService({})
    expect(service.isVerified()).toBeNull()
    expect((await service.send()).ok).toBe(false)
    expect((await service.refresh()).ok).toBe(false)
    expect(sendEmailVerification).not.toHaveBeenCalled()
  })
})

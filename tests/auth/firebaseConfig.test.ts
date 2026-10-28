import { readFirebaseConfig } from '@/lib/firebase/config'
import { createAuthGateway } from '@/features/auth/services/createAuthGateway'
import { NOT_CONFIGURED_MESSAGE } from '@/features/auth/services/unconfiguredAuthGateway'

const FULL = {
  VITE_FIREBASE_API_KEY: 'k',
  VITE_FIREBASE_AUTH_DOMAIN: 'd.example',
  VITE_FIREBASE_PROJECT_ID: 'p',
  VITE_FIREBASE_APP_ID: 'a',
}

describe('configuración de Firebase', () => {
  it('con variables completas devuelve la configuración', () => {
    const result = readFirebaseConfig({ ...FULL, VITE_FIREBASE_STORAGE_BUCKET: 'b' })
    expect(result).toMatchObject({ ok: true, config: { apiKey: 'k', projectId: 'p', storageBucket: 'b' } })
  })

  it('sin variables informa solo los nombres faltantes', () => {
    const result = readFirebaseConfig({ VITE_FIREBASE_API_KEY: '  ', VITE_FIREBASE_APP_ID: 'a' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.missing).toEqual([
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
      ])
    }
  })

  it('configuración ausente: gateway controlado que nunca simula éxito', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const gateway = createAuthGateway({})
    const results = await Promise.all([
      gateway.signInWithEmail('ana@dominio.com', 'secreta123'),
      gateway.signInWithGoogle(),
      gateway.signUpWithEmail('ana@dominio.com', 'secreta123'),
      gateway.requestPasswordReset('ana@dominio.com'),
      gateway.signOut(),
    ])
    for (const result of results) {
      expect(result).toEqual({ ok: false, code: 'not-configured', message: NOT_CONFIGURED_MESSAGE })
    }
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).not.toContain('ana@dominio.com')
    warn.mockRestore()
  })

  it('configuración ausente: el observer informa "sin sesión" y se puede cancelar', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const next = vi.fn()
    const stop = createAuthGateway({}).onAuthChange(next)
    await Promise.resolve()
    expect(next).toHaveBeenCalledWith(null)
    expect(typeof stop).toBe('function')
  })
})

import type { EmailVerificationService } from '@/features/tasks/services/emailVerificationService'

export const EMAIL = 'ana@dominio.com'

/** Servicio de verificación de mentira: nunca habla con Firebase. */
export function fakeVerification(over: Partial<EmailVerificationService> = {}): EmailVerificationService {
  return {
    isVerified: () => false,
    email: () => EMAIL,
    send: vi.fn(() => Promise.resolve({ ok: true as const })),
    refresh: vi.fn(() => Promise.resolve({ ok: true as const, verified: false })),
    ...over,
  }
}

import { getFirebaseAuth } from '@/lib/firebase/client'
import { readFirebaseConfig } from '@/lib/firebase/config'

export const SUMMARY_ENDPOINT = '/api/tasks/summary-email'

export type SummaryEmailResult = { readonly ok: true } | { readonly ok: false; readonly message: string }

/** Frontera del navegador con el endpoint: el componente nunca ve tokens ni URLs. */
export interface SummaryEmailService {
  /** true / false según la sesión actual; null si no hay sesión o Firebase no está configurado. */
  isEmailVerified(): boolean | null
  send(): Promise<SummaryEmailResult>
}

const GENERIC = 'No pudimos enviar el resumen. Intentá de nuevo más tarde.'
const NO_SESSION = 'Tu sesión no es válida. Volvé a iniciar sesión.'

type Env = Readonly<Record<string, unknown>>
type Fetch = typeof fetch

/** El servidor devuelve mensajes ya redactados en español; si no hay, se usa uno genérico. */
async function failure(response: Response): Promise<SummaryEmailResult> {
  const body: unknown = await response.json().catch(() => null)
  const message = typeof body === 'object' && body !== null && 'message' in body ? body.message : null
  return { ok: false, message: typeof message === 'string' ? message : GENERIC }
}

export function createSummaryEmailService(env: Env = import.meta.env, request: Fetch = fetch): SummaryEmailService {
  const config = readFirebaseConfig(env)
  const user = () => (config.ok ? getFirebaseAuth(config.config).currentUser : null)
  return {
    isEmailVerified: () => user()?.emailVerified ?? null,
    async send() {
      const current = user()
      if (!current) return { ok: false, message: NO_SESSION }
      try {
        const token = await current.getIdToken()
        const response = await request(SUMMARY_ENDPOINT, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'X-Requested-With': 'ongoing-web' },
        })
        return response.ok ? { ok: true } : await failure(response)
      } catch {
        return { ok: false, message: 'No hay conexión con el servidor. Revisá tu red e intentá de nuevo.' }
      }
    },
  }
}

export const unavailableSummaryEmailService: SummaryEmailService = {
  isEmailVerified: () => null,
  send: () => Promise.resolve({ ok: false, message: NO_SESSION }),
}

/** Variables públicas de la app web de Firebase (no son secretos, pero tampoco se versionan). */
const REQUIRED_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const

export interface FirebaseWebConfig {
  readonly apiKey: string
  readonly authDomain: string
  readonly projectId: string
  readonly appId: string
  readonly storageBucket?: string
  readonly messagingSenderId?: string
}

export type FirebaseConfigResult =
  | { readonly ok: true; readonly config: FirebaseWebConfig }
  /** `missing` contiene solo nombres de variables, nunca valores. */
  | { readonly ok: false; readonly missing: readonly string[] }

type EnvSource = Readonly<Record<string, unknown>>

function read(env: EnvSource, key: string): string | undefined {
  const value = env[key]
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

export function readFirebaseConfig(env: EnvSource): FirebaseConfigResult {
  const missing = REQUIRED_KEYS.filter((key) => read(env, key) === undefined)
  if (missing.length > 0) return { ok: false, missing }

  const storageBucket = read(env, 'VITE_FIREBASE_STORAGE_BUCKET')
  const messagingSenderId = read(env, 'VITE_FIREBASE_MESSAGING_SENDER_ID')
  return {
    ok: true,
    config: {
      apiKey: read(env, 'VITE_FIREBASE_API_KEY') ?? '',
      authDomain: read(env, 'VITE_FIREBASE_AUTH_DOMAIN') ?? '',
      projectId: read(env, 'VITE_FIREBASE_PROJECT_ID') ?? '',
      appId: read(env, 'VITE_FIREBASE_APP_ID') ?? '',
      ...(storageBucket && { storageBucket }),
      ...(messagingSenderId && { messagingSenderId }),
    },
  }
}

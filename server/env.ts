export type Env = Readonly<Record<string, string | undefined>>

const REQUIRED = [
  'AWS_REGION',
  'SES_FROM_EMAIL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
] as const

export interface ServerConfig {
  readonly awsRegion: string
  /** Si faltan las claves, el SDK de AWS usa su cadena de credenciales estándar (rol, perfil, etc.). */
  readonly awsCredentials: { readonly accessKeyId: string; readonly secretAccessKey: string } | null
  readonly fromEmail: string
  readonly firebase: { readonly projectId: string; readonly clientEmail: string; readonly privateKey: string }
  readonly allowedOrigins: readonly string[]
}

export type ConfigResult =
  | { readonly ok: true; readonly config: ServerConfig }
  | { readonly ok: false; readonly missing: readonly string[] }

const value = (env: Env, key: string) => env[key]?.trim() ?? ''

/** Lee la configuración del servidor. Devuelve solo los NOMBRES de lo que falta, nunca valores. */
export function readServerConfig(env: Env): ConfigResult {
  const missing: string[] = REQUIRED.filter((key) => value(env, key) === '')
  const keyId = value(env, 'AWS_ACCESS_KEY_ID')
  const secret = value(env, 'AWS_SECRET_ACCESS_KEY')
  if ((keyId === '') !== (secret === '')) missing.push(keyId === '' ? 'AWS_ACCESS_KEY_ID' : 'AWS_SECRET_ACCESS_KEY')
  if (missing.length > 0) return { ok: false, missing }
  return {
    ok: true,
    config: {
      awsRegion: value(env, 'AWS_REGION'),
      awsCredentials: keyId ? { accessKeyId: keyId, secretAccessKey: secret } : null,
      fromEmail: value(env, 'SES_FROM_EMAIL'),
      firebase: {
        projectId: value(env, 'FIREBASE_PROJECT_ID'),
        clientEmail: value(env, 'FIREBASE_CLIENT_EMAIL'),
        // Las variables multilínea suelen guardarse con \n literales.
        privateKey: value(env, 'FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      },
      allowedOrigins: value(env, 'APP_ALLOWED_ORIGINS').split(',').map((o) => o.trim()).filter(Boolean),
    },
  }
}

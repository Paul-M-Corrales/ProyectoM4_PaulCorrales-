import { readServerConfig, type Env } from './env.js'
import { createAdmin } from './firebaseAdmin.js'
import { createRateLimiter } from './rateLimit.js'
import { createSesSender } from './ses.js'
import { createTasksLoader } from './tasksSource.js'
import type { Deps } from './types.js'

export type DepsResult =
  | { readonly ok: true; readonly deps: Deps }
  | { readonly ok: false; readonly missing: readonly string[] }

/** Cablea Firebase Admin + SES a partir del entorno del servidor; sin configuración completa no hay envío. */
export function createDeps(env: Env): DepsResult {
  const result = readServerConfig(env)
  if (!result.ok) return result
  const { config } = result
  const { auth, db } = createAdmin(config)
  return {
    ok: true,
    deps: {
      async verifyToken(token) {
        const decoded = await auth.verifyIdToken(token)
        return {
          uid: decoded.uid,
          email: decoded.email ?? null,
          emailVerified: decoded.email_verified === true,
          name: typeof decoded.name === 'string' ? decoded.name : null,
        }
      },
      loadTasks: createTasksLoader(db),
      reserveSend: createRateLimiter(db),
      sender: createSesSender(config),
      allowedOrigins: config.allowedOrigins,
    },
  }
}

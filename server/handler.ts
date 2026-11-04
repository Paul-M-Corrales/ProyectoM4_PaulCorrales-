import { renderText } from './emailText.js'
import { renderHtml, SUBJECT } from './emailTemplate.js'
import { describeSesError } from './sesDiagnostics.js'
import { buildSummary } from './summary.js'
import type { DepsResult } from './deps.js'
import type { Deps, ErrorCode, VerifiedToken } from './types.js'
import { checkOrigin, REQUIRED_HEADER, REQUIRED_HEADER_VALUE } from './origin.js'

const MESSAGES: Record<ErrorCode, string> = {
  method_not_allowed: 'Método no permitido.',
  forbidden_origin: 'Solicitud no permitida.',
  unauthorized: 'Tu sesión no es válida o expiró. Volvé a iniciar sesión.',
  email_not_verified: 'Tu cuenta no tiene un correo verificado, así que no podemos enviarte el resumen.',
  rate_limited: 'Ya pediste un resumen hace poco. Esperá un momento antes de intentarlo de nuevo.',
  not_configured: 'El envío por correo todavía no está disponible.',
  send_failed: 'No pudimos enviar el correo. Intentá de nuevo más tarde.',
  internal: 'Ocurrió un error inesperado. Intentá de nuevo más tarde.',
}

const STATUS: Record<ErrorCode, number> = {
  method_not_allowed: 405,
  forbidden_origin: 403,
  unauthorized: 401,
  email_not_verified: 403,
  rate_limited: 429,
  not_configured: 503,
  send_failed: 502,
  internal: 500,
}

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })

function fail(code: ErrorCode, headers: Record<string, string> = {}) {
  return json(STATUS[code], { ok: false, code, message: MESSAGES[code] }, headers)
}

const bearer = (request: Request) => /^Bearer (\S+)$/.exec(request.headers.get('authorization') ?? '')?.[1] ?? null

/** Registra solo el tipo de error: nunca tokens, credenciales ni contenido del correo. */
const logError = (stage: string, error: unknown) =>
  console.error(`[summary-email] ${stage}: ${error instanceof Error ? error.name : 'unknown'}`)

async function authenticate(deps: Deps, token: string): Promise<VerifiedToken | null> {
  try {
    return await deps.verifyToken(token)
  } catch (error) {
    // Distingue en los logs un token vencido de una credencial de Admin mal configurada (solo el tipo de error).
    logError('auth', error)
    return null
  }
}

/** POST /api/tasks/summary-email: el UID y el destinatario salen siempre del token verificado. */
export function createSummaryEmailHandler(getDeps: () => DepsResult) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') return fail('method_not_allowed', { Allow: 'POST' })
    if (request.headers.get(REQUIRED_HEADER) !== REQUIRED_HEADER_VALUE) return fail('forbidden_origin')

    let result: DepsResult
    try {
      result = getDeps()
    } catch (error) {
      logError('init', error)
      return fail('not_configured')
    }
    if (!result.ok) {
      console.error(`[summary-email] configuración incompleta: ${result.missing.join(', ')}`)
      return fail('not_configured')
    }
    const { deps } = result
    if (!checkOrigin(request, deps.allowedOrigins)) return fail('forbidden_origin')

    const token = bearer(request)
    const user = token ? await authenticate(deps, token) : null
    if (!user) return fail('unauthorized')
    if (!user.email || !user.emailVerified) return fail('email_not_verified')

    try {
      const reservation = await deps.reserveSend(user.uid)
      if (!reservation.allowed) {
        return fail('rate_limited', { 'Retry-After': String(reservation.retryAfterSeconds) })
      }
      const summary = buildSummary(await deps.loadTasks(user.uid))
      try {
        await deps.sender.send({
          to: user.email,
          subject: SUBJECT,
          html: renderHtml(summary, user.name),
          text: renderText(summary, user.name),
        })
      } catch (error) {
        console.error(`[summary-email] ses: ${describeSesError(error, user.email)}`)
        return fail('send_failed')
      }
      return json(202, { ok: true, status: 'accepted' })
    } catch (error) {
      logError('internal', error)
      return fail('internal')
    }
  }
}

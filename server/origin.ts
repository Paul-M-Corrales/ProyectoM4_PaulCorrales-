/** Cabecera propia: obliga a un preflight CORS en solicitudes de otros orígenes (no la envía un formulario HTML). */
export const REQUIRED_HEADER = 'x-requested-with'
export const REQUIRED_HEADER_VALUE = 'ongoing-web'

/**
 * Un navegador siempre envía Origin en un POST. Se acepta el mismo host o los orígenes autorizados
 * (APP_ALLOWED_ORIGINS). Sin Origin (curl, servidores) decide el token: esto no sustituye la autenticación.
 */
export function checkOrigin(request: Request, allowed: readonly string[] = []): boolean {
  const origin = request.headers.get('origin')
  if (origin === null) return true
  if (allowed.includes(origin)) return true
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return host !== null && new URL(origin).host === host
  } catch {
    return false
  }
}

/**
 * Diagnóstico seguro de errores de AWS SES (solo servidor, solo logs).
 *
 * Nunca se registra `error.message` tal cual: se extraen campos de una lista explícita y cada valor sale de un
 * conjunto cerrado o de una expresión estricta. Ante un formato desconocido el campo simplemente se omite.
 * No se emiten ARN, ID de cuenta, direcciones de correo, credenciales ni contenido de la solicitud.
 */

const OPERATION = 'SendEmail(sesv2)'
const NAME_RE = /^[A-Za-z0-9_.]{1,64}$/
const REQUEST_ID_RE = /^[A-Za-z0-9-]{8,64}$/
const ACTION_RE = /not authorized to perform: (ses:[A-Za-z]{3,40})/
const RESOURCE_RE = /on resource: arn:aws:ses:([a-z]{2}(?:-[a-z]+)+-\d):\d{12}:([a-z-]{3,30})\/(\S+?)(?: because|$)/
const RESOURCE_TYPES = new Set(['identity', 'configuration-set', 'template', 'contact-list', 'dedicated-ip-pool'])

/** Motivos que AWS documenta para una denegación IAM, traducidos a códigos propios. */
const REASONS: readonly (readonly [string, string])[] = [
  ['no identity-based policy allows', 'no-identity-policy-allow'],
  ['explicit deny in an identity-based policy', 'explicit-deny-identity-policy'],
  ['explicit deny in a service control policy', 'explicit-deny-scp'],
  ['no service control policy allows', 'no-scp-allow'],
  ['explicit deny in a permissions boundary', 'explicit-deny-boundary'],
  ['no permissions boundary allows', 'no-boundary-allow'],
  ['explicit deny in a resource-based policy', 'explicit-deny-resource-policy'],
  ['no resource-based policy allows', 'no-resource-policy-allow'],
  ['explicit deny in a session policy', 'explicit-deny-session-policy'],
]

interface AwsErrorShape {
  readonly name?: unknown
  readonly message?: unknown
  readonly $fault?: unknown
  readonly $metadata?: { readonly httpStatusCode?: unknown; readonly requestId?: unknown; readonly attempts?: unknown }
}

/** Qué identidad (si alguna) se denegó, sin revelar su valor: `recipient` solo si coincide con el destinatario. */
function resourceRole(name: string, recipient: string | null): string {
  if (recipient && name.toLowerCase() === recipient.toLowerCase()) return 'recipient'
  return 'other-identity'
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function fromMessage(message: unknown, recipient: string | null): string[] {
  if (typeof message !== 'string') return []
  const parts: string[] = []
  const action = ACTION_RE.exec(message)?.[1]
  if (action) parts.push(`action=${action}`)
  const resource = RESOURCE_RE.exec(message)
  if (resource) {
    const [, region, type, name] = resource as unknown as [string, string, string, string]
    if (RESOURCE_TYPES.has(type)) {
      parts.push(`resourceType=${type}`, `resourceRegion=${region}`)
      if (type === 'identity') parts.push(`resourceRole=${resourceRole(safeDecode(name), recipient)}`)
    }
  }
  const lower = message.toLowerCase()
  const reason = REASONS.find(([phrase]) => lower.includes(phrase))?.[1]
  if (reason) parts.push(`reason=${reason}`)
  return parts
}

/**
 * Resumen en una línea, apto para logs. `recipient` solo se usa para comparar localmente y nunca se imprime.
 * Si el error no parece de AWS (sin `$metadata`) solo se registra su nombre.
 */
export function describeSesError(error: unknown, recipient: string | null = null): string {
  if (typeof error !== 'object' || error === null) return 'name=unknown'
  const e = error as AwsErrorShape
  const name = typeof e.name === 'string' && NAME_RE.test(e.name) ? e.name : 'unknown'
  const meta = e.$metadata
  if (!meta || typeof meta !== 'object') return `name=${name}`

  const parts = [`name=${name}`, `operation=${OPERATION}`]
  if (typeof meta.httpStatusCode === 'number') parts.push(`http=${Math.trunc(meta.httpStatusCode)}`)
  if (typeof meta.requestId === 'string' && REQUEST_ID_RE.test(meta.requestId)) parts.push(`requestId=${meta.requestId}`)
  if (typeof meta.attempts === 'number') parts.push(`attempts=${Math.trunc(meta.attempts)}`)
  if (e.$fault === 'client' || e.$fault === 'server') parts.push(`fault=${e.$fault}`)
  return [...parts, ...fromMessage(e.message, recipient)].join(' ')
}

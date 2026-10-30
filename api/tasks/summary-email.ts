import { createDeps, type DepsResult } from '../../server/deps.js'
import { createSummaryEmailHandler } from '../../server/handler.js'

// Una sola inicialización por instancia; el límite de frecuencia es persistente (Firestore), no de memoria.
let cached: DepsResult | undefined
const handle = createSummaryEmailHandler(() => (cached ??= createDeps(process.env)))

// Todos los métodos pasan por el mismo manejador, que responde 405 salvo POST.
export const POST = handle
export const GET = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle

import type { TaskActionResult } from '../types'

/** Tiempo máximo esperando la confirmación del servidor antes de avisar que no se pudo confirmar. */
export const CONFIRM_TIMEOUT_MS = 15_000

const MESSAGES: Readonly<Record<string, string>> = {
  'permission-denied': 'No tenés permiso para esta operación. Volvé a iniciar sesión e intentá de nuevo.',
  unauthenticated: 'Tu sesión expiró. Volvé a iniciar sesión.',
  unavailable: 'No hay conexión con el servidor. Revisá tu red e intentá de nuevo.',
  'deadline-exceeded': 'El servidor tardó demasiado en responder. Intentá de nuevo.',
  'not-found': 'La tarea ya no existe.',
}

/** Traduce un error del SDK a un mensaje para la persona; nunca expone detalles internos. */
export function describeFirestoreError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  return MESSAGES[code.replace('firestore/', '')] ?? 'No pudimos completar la operación. Intentá de nuevo.'
}

const UNCONFIRMED: TaskActionResult = {
  ok: false,
  message:
    'No pudimos confirmar el guardado (¿sin conexión?). Si la tarea aparece en la lista, se enviará al volver la conexión.',
}

/** Ejecuta una escritura y espera la confirmación del servidor, con tope de tiempo. */
export async function confirmed(write: () => Promise<unknown>): Promise<TaskActionResult> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), CONFIRM_TIMEOUT_MS)
  })
  try {
    const outcome = await Promise.race([write().then(() => 'done' as const), timeout])
    return outcome === 'done' ? { ok: true } : UNCONFIRMED
  } catch (error) {
    return { ok: false, message: describeFirestoreError(error) }
  } finally {
    clearTimeout(timer)
  }
}

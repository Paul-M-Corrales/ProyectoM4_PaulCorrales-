const pad = (value: number) => String(value).padStart(2, '0')
const ISO = /^\d{4}-\d{2}-\d{2}$/

export const PAST_DUE_MESSAGE = 'La fecha límite no puede ser anterior a hoy.'

/**
 * Día de calendario LOCAL del usuario en formato AAAA-MM-DD.
 * No usa `toISOString()`: eso devuelve el día en UTC y, de noche, adelanta o atrasa la fecha según la zona.
 */
export function todayLocal(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** true si `iso` es un día anterior a `today`. El formato AAAA-MM-DD ordena igual como texto que como calendario. */
export function isBeforeToday(iso: string, today: string = todayLocal()): boolean {
  return ISO.test(iso) && iso < today
}

/**
 * Regla de vencimiento: solo se bloquea ASIGNAR una fecha pasada. Conservar la fecha vencida original de una tarea
 * existente (`original`) sigue siendo válido, y «sin fecha» (null) siempre lo es.
 */
export function pastDueError(
  dueDate: string | null,
  original: string | null = null,
  today: string = todayLocal(),
): string | undefined {
  if (dueDate === null || dueDate === original) return undefined
  return isBeforeToday(dueDate, today) ? PAST_DUE_MESSAGE : undefined
}

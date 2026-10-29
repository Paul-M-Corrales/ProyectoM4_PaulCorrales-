const FORMAT = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' })

/** Convierte AAAA-MM-DD en una fecha legible sin desfases de zona horaria. */
export function formatDueDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return FORMAT.format(new Date(year, month - 1, day))
}

export function isOverdue(iso: string, today: Date = new Date()): boolean {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return false
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return new Date(year, month - 1, day) < start
}

const SHORT = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' })

function parse(iso: string): Date | null {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** Días entre hoy y la fecha límite (negativo = vencida). null si la fecha no es válida. */
export function daysFromToday(iso: string, today: Date = new Date()): number | null {
  const due = parse(iso)
  if (!due) return null
  return Math.round((due.getTime() - startOfDay(today).getTime()) / 86_400_000)
}

/** "Hoy", "Mañana", "Ayer" o "Vie, 16 may", sin desfases de zona horaria. */
export function formatDueDate(iso: string, today: Date = new Date()): string {
  const days = daysFromToday(iso, today)
  if (days === null) return iso
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  if (days === -1) return 'Ayer'
  const text = SHORT.format(parse(iso) as Date).replace(/\./g, '').replace(',', '')
  const [weekday = '', ...rest] = text.split(' ')
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${rest.join(' ')}`
}

export function isOverdue(iso: string, today: Date = new Date()): boolean {
  const days = daysFromToday(iso, today)
  return days !== null && days < 0
}

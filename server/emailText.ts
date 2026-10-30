import { closingMessage } from './emailTemplate.js'
import { formatDate } from './escapeHtml.js'
import type { Summary } from './summary.js'

/** Versión de texto plano del mismo resumen, para clientes sin HTML. */
export function renderText(summary: Summary, name: string | null): string {
  const lines = summary.listed.map((task) => {
    const date = formatDate(task.dueDate)
    return `- ${task.title} (prioridad ${task.priority}${date ? `, vence ${date}` : ''})`
  })
  return [
    `Hola${name ? `, ${name}` : ''}:`,
    '',
    'Este es el resumen de tus tareas en On-going.',
    `Total: ${summary.total} | Completadas: ${summary.completed} | Pendientes: ${summary.pending} | Progreso: ${summary.percent}%`,
    '',
    ...(lines.length > 0 ? ['Tareas pendientes:', ...lines] : []),
    ...(summary.hidden > 0 ? [`… y ${summary.hidden} tareas pendientes más (no se muestran en este resumen).`] : []),
    ...(summary.partial ? ['El resumen considera solo las primeras 500 tareas.'] : []),
    '',
    closingMessage(summary),
  ].join('\n')
}

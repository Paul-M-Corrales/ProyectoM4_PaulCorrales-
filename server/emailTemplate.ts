import { escapeHtml, formatDate } from './escapeHtml.js'
import type { Summary } from './summary.js'
import type { Priority, SummaryTask } from './types.js'

export const SUBJECT = 'Tu resumen de tareas — On-going'

const PRIORITY: Record<Priority, { label: string; bg: string; fg: string }> = {
  alta: { label: 'Alta', bg: '#ffdcec', fg: '#a3174f' },
  media: { label: 'Media', bg: '#fff4c7', fg: '#7a5b00' },
  baja: { label: 'Baja', bg: '#e6f7d6', fg: '#1d6b3a' },
}

const FONT = 'font-family:Segoe UI,Helvetica,Arial,sans-serif;'

const stat = (value: string, label: string, bg: string) =>
  `<td align="center" style="background:${bg};border-radius:14px;padding:14px 8px;${FONT}">` +
  `<div style="font-size:26px;font-weight:800;color:#0c0c10">${escapeHtml(value)}</div>` +
  `<div style="font-size:12px;color:#3a3b45">${escapeHtml(label)}</div></td>`

function row(task: SummaryTask): string {
  const tone = PRIORITY[task.priority]
  const date = formatDate(task.dueDate)
  return (
    `<tr><td style="padding:10px 0;border-bottom:1px solid #ebebf0;${FONT}font-size:15px;color:#0c0c10">` +
    `${escapeHtml(task.title)}<br>` +
    `<span style="display:inline-block;margin-top:4px;padding:2px 10px;border-radius:999px;background:${tone.bg};` +
    `color:${tone.fg};font-size:12px;font-weight:700">Prioridad ${tone.label}</span>` +
    (date ? ` <span style="font-size:12px;color:#656774">Vence: ${escapeHtml(date)}</span>` : '') +
    '</td></tr>'
  )
}

const note = (text: string) =>
  `<p style="${FONT}font-size:13px;color:#656774;margin:12px 0 0">${escapeHtml(text)}</p>`

export function closingMessage(summary: Summary): string {
  if (summary.total === 0) return 'Todavía no tenés tareas: cuando crees la primera, tu resumen aparecerá acá.'
  if (summary.pending === 0) return '¡Completaste todo! Disfrutá el descanso, te lo ganaste.'
  return 'Paso a paso se llega lejos. ¡Seguí así!'
}

export function renderHtml(summary: Summary, name: string | null): string {
  const list =
    summary.listed.length > 0
      ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${summary.listed.map(row).join('')}</table>`
      : ''
  const more = summary.hidden > 0 ? note(`… y ${summary.hidden} tareas pendientes más (no se muestran en este resumen).`) : ''
  const partial = summary.partial ? note('El resumen considera solo las primeras 500 tareas.') : ''
  return (
    '<!doctype html><html lang="es"><body style="margin:0;background:#f6f6f9;padding:24px 12px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">' +
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;' +
    'background:#ffffff;border-radius:20px;padding:28px 24px">' +
    `<tr><td style="${FONT}"><div style="height:6px;border-radius:6px;background:#ffd23f;margin-bottom:20px"></div>` +
    `<h1 style="font-size:22px;margin:0 0 8px;color:#0c0c10">Hola${name ? `, ${escapeHtml(name)}` : ''}</h1>` +
    '<p style="font-size:15px;color:#3a3b45;margin:0 0 20px">Este es el resumen de tus tareas en On-going.</p></td></tr>' +
    '<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="8"><tr>' +
    `${stat(String(summary.total), 'Total', '#ece6ff')}${stat(String(summary.completed), 'Completadas', '#e6f7d6')}` +
    `${stat(String(summary.pending), 'Pendientes', '#fff4c7')}${stat(`${summary.percent}%`, 'Progreso', '#ffdcec')}` +
    '</tr></table></td></tr>' +
    `<tr><td style="${FONT}padding-top:20px"><h2 style="font-size:17px;margin:0 0 4px;color:#0c0c10">Tareas pendientes</h2>` +
    `${list}${more}${partial}` +
    `<p style="font-size:15px;color:#0c0c10;margin:24px 0 0;font-weight:700">${escapeHtml(closingMessage(summary))}</p>` +
    '</td></tr></table></td></tr></table></body></html>'
  )
}

import { renderText } from '../../server/emailText'
import { renderHtml } from '../../server/emailTemplate'
import { buildSummary } from '../../server/summary'
import type { SummaryTask } from '../../server/types'

const task = (title: string, completed: boolean, over: Partial<SummaryTask> = {}): SummaryTask => ({
  title, completed, priority: 'media', dueDate: null, ...over,
})
const render = (tasks: SummaryTask[], name: string | null = 'Ana') => {
  const summary = buildSummary(tasks)
  return { summary, html: renderHtml(summary, name), text: renderText(summary, name) }
}

describe('contenido del correo por escenario', () => {
  it('A: sin tareas informa claramente que no hay tareas', () => {
    const { summary, html, text } = render([])
    expect(summary).toMatchObject({ total: 0, completed: 0, pending: 0, percent: 0 })
    expect(html).toContain('Todavía no tenés tareas')
    expect(text).toContain('Total: 0 | Completadas: 0 | Pendientes: 0 | Progreso: 0%')
    expect(text).toContain('Todavía no tenés tareas')
  })

  it('B: todas pendientes', () => {
    const { summary, text } = render([task('Uno', false), task('Dos', false), task('Tres', false)])
    expect(summary).toMatchObject({ total: 3, completed: 0, pending: 3, percent: 0 })
    expect(text).toContain('Pendientes: 3')
    for (const title of ['Uno', 'Dos', 'Tres']) expect(text).toContain(title)
  })

  it('C: todas completadas, sin lista de pendientes', () => {
    const { summary, html, text } = render([task('Uno', true), task('Dos', true)])
    expect(summary).toMatchObject({ total: 2, completed: 2, pending: 0, percent: 100 })
    expect(text).not.toContain('Tareas pendientes:')
    expect(text).not.toContain('- Uno')
    expect(html).toContain('Completaste todo')
  })

  it('D: estado mixto, sin atribuir tareas completadas a pendientes', () => {
    const { summary, text } = render([task('Hecha', true), task('Falta', false), task('Otra falta', false)])
    expect(summary).toMatchObject({ total: 3, completed: 1, pending: 2, percent: 33 })
    expect(text).toContain('- Falta')
    expect(text).toContain('- Otra falta')
    expect(text).not.toContain('- Hecha')
  })

  it('E: caracteres especiales se escapan y no inyectan HTML', () => {
    const evil = `<img src=x onerror=alert(1)> "comillas" 'simples' & ñandú áéíóú €`
    const { html } = render([task(evil, false)], '<script>alert(2)</script>')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('&quot;comillas&quot;')
    expect(html).toContain('&#39;simples&#39;')
    expect(html).toContain('ñandú áéíóú €')
  })
})

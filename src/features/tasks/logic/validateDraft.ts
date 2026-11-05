import { pastDueError } from './localDate'
import type { TaskChanges, TaskDraft } from '../types'

export const TITLE_MAX = 120
export const DESCRIPTION_MAX = 500

export type DraftErrors = Partial<Record<'title' | 'description' | 'dueDate', string>>

/** Contexto de la regla de vencimiento. Sin él solo se valida el formato (p. ej. datos ya guardados). */
export interface DueRules {
  readonly today: string
  /** Vencimiento actual de la tarea que se edita (null o ausente al crear). */
  readonly original?: string | null
}

export function validateDraft(draft: TaskDraft, rules?: DueRules): DraftErrors {
  const errors: DraftErrors = {}
  if (!draft.title.trim()) errors.title = 'Escribí un título para la tarea.'
  else if (draft.title.length > TITLE_MAX) errors.title = `Máximo ${TITLE_MAX} caracteres.`
  if (draft.description.length > DESCRIPTION_MAX) {
    errors.description = `Máximo ${DESCRIPTION_MAX} caracteres.`
  }
  if (draft.dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(draft.dueDate)) {
    errors.dueDate = 'Elegí una fecha válida.'
  } else if (rules) {
    const past = pastDueError(draft.dueDate, rules.original ?? null, rules.today)
    if (past) errors.dueDate = past
  }
  return errors
}

/** Valida solo los campos presentes en una edición parcial (p. ej. marcar como completada). */
export function validateChanges(changes: TaskChanges, rules?: DueRules): DraftErrors {
  return validateDraft(
    {
      title: changes.title ?? 'ok',
      description: changes.description ?? '',
      priority: changes.priority ?? 'media',
      dueDate: changes.dueDate ?? null,
    },
    rules,
  )
}

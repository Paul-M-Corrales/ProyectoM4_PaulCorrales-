import type { TaskDraft } from '../types'

export const TITLE_MAX = 120
export const DESCRIPTION_MAX = 500

export type DraftErrors = Partial<Record<'title' | 'description' | 'dueDate', string>>

export function validateDraft(draft: TaskDraft): DraftErrors {
  const errors: DraftErrors = {}
  if (!draft.title.trim()) errors.title = 'Escribí un título para la tarea.'
  else if (draft.title.length > TITLE_MAX) errors.title = `Máximo ${TITLE_MAX} caracteres.`
  if (draft.description.length > DESCRIPTION_MAX) {
    errors.description = `Máximo ${DESCRIPTION_MAX} caracteres.`
  }
  if (draft.dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(draft.dueDate)) {
    errors.dueDate = 'Elegí una fecha válida.'
  }
  return errors
}

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { todayLocal } from '../logic/localDate'
import { validateDraft, DESCRIPTION_MAX, TITLE_MAX, type DraftErrors } from '../logic/validateDraft'
import { PRIORITIES, type Priority, type Task, type TaskActionResult, type TaskDraft } from '../types'
import styles from './task-form.module.css'

interface Props {
  /** Tarea que se está editando; sin ella el formulario crea una nueva. */
  readonly initial?: Task | undefined
  readonly onSubmit: (draft: TaskDraft) => Promise<TaskActionResult>
  readonly onCancel: () => void
}

const PRIORITY_LABELS: Record<Priority, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' }

export function TaskForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '')
  const [errors, setErrors] = useState<DraftErrors>({})
  const [failure, setFailure] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  // Una tarea ya vencida conserva su fecha original como mínimo válido; las nuevas no admiten días pasados.
  const original = initial?.dueDate ?? null
  const today = todayLocal()
  const minDate = original !== null && original < today ? original : today

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    const draft: TaskDraft = { title: title.trim(), description: description.trim(), priority, dueDate: dueDate || null }
    // Al guardar se recalcula «hoy»: el formulario puede haber quedado abierto pasada la medianoche.
    const found = validateDraft(draft, { today: todayLocal(), original: initial?.dueDate ?? null })
    setErrors(found)
    setFailure(undefined)
    if (Object.keys(found).length > 0) return
    setPending(true)
    const result = await onSubmit(draft)
    setPending(false)
    if (result.ok) onCancel()
    else setFailure(result.message)
  }

  return (
    <form className={styles.form} onSubmit={(event) => void submit(event)} noValidate>
      <h2 className={styles.heading}>{initial ? 'Editar tarea' : 'Nueva tarea'}</h2>
      <label className={styles.field}>
        Título
        <input
          value={title}
          maxLength={TITLE_MAX}
          aria-invalid={errors.title ? true : undefined}
          onChange={(event) => setTitle(event.target.value)}
        />
        {errors.title && <span className={styles.error} role="alert">{errors.title}</span>}
      </label>
      <label className={styles.field}>
        Descripción (opcional)
        <textarea
          rows={2}
          value={description}
          maxLength={DESCRIPTION_MAX}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <div className={styles.row}>
        <label className={styles.field}>
          Prioridad
          <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>{PRIORITY_LABELS[value]}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Fecha límite
          <input
            type="date"
            value={dueDate}
            min={minDate}
            aria-invalid={errors.dueDate ? true : undefined}
            onChange={(event) => setDueDate(event.target.value)}
          />
          {errors.dueDate && <span className={styles.error} role="alert">{errors.dueDate}</span>}
        </label>
      </div>
      {failure && <p className={styles.notice} role="alert">{failure}</p>}
      <div className={styles.actions}>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar tarea'}</Button>
      </div>
    </form>
  )
}

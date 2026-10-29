import { useState, type FormEvent } from 'react'
import { validateDraft, DESCRIPTION_MAX, TITLE_MAX, type DraftErrors } from '../logic/validateDraft'
import { PRIORITIES, type Priority, type TaskActionResult, type TaskDraft } from '../types'
import styles from './task-form.module.css'

interface Props {
  readonly onSubmit: (draft: TaskDraft) => Promise<TaskActionResult>
  readonly onCancel: () => void
}

const PRIORITY_LABELS: Record<Priority, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' }

export function TaskForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState<DraftErrors>({})
  const [failure, setFailure] = useState<string | undefined>()
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    const draft: TaskDraft = { title: title.trim(), description: description.trim(), priority, dueDate: dueDate || null }
    const found = validateDraft(draft)
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
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
      </div>
      {failure && <p className={styles.notice} role="alert">{failure}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.save} disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar tarea'}
        </button>
      </div>
    </form>
  )
}

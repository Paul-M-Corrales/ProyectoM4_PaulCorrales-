import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './fields.module.css'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  readonly label: string
  readonly error?: string | undefined
  readonly trailing?: ReactNode
}

export function TextField({ label, error, trailing, ...input }: Props) {
  const id = useId()
  const errorId = `${id}-error`
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control} data-invalid={error ? 'true' : undefined}>
        <input
          {...input}
          id={id}
          className={styles.input}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

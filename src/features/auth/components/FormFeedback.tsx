import type { FormStatus } from '../types'
import styles from './fields.module.css'

export function FormFeedback({ status }: { readonly status: FormStatus }) {
  if (status.kind === 'error') {
    return (
      <p className={`${styles.feedback} ${styles.feedbackError}`} role="alert">
        {status.message}
      </p>
    )
  }
  if (status.kind === 'notice' || status.kind === 'success') {
    return (
      <p className={`${styles.feedback} ${styles.feedbackNotice}`} role="status">
        {status.message}
      </p>
    )
  }
  return null
}

import { useRef, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useFocusFirstInvalid } from '../hooks/useFocusFirstInvalid'
import { useResetForm } from '../hooks/useResetForm'
import type { AuthGateway } from '../types'
import { FormFeedback } from './FormFeedback'
import { Spinner } from './Spinner'
import { TextField } from './TextField'
import styles from './buttons.module.css'
import formStyles from './login-form.module.css'

export function ResetForm({ gateway }: { readonly gateway: AuthGateway }) {
  const { email, error, status, invalidTick, change, submit } = useResetForm(gateway)
  const formRef = useRef<HTMLFormElement>(null)
  const loading = status.kind === 'loading'
  useFocusFirstInvalid(formRef, invalidTick)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  return (
    <form ref={formRef} className={formStyles.form} onSubmit={onSubmit} noValidate aria-busy={loading}>
      <TextField
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="nombre@dominio.com"
        value={email}
        error={error}
        onChange={(e) => change(e.target.value)}
      />
      <FormFeedback status={status} />
      <button type="submit" className={styles.primary} disabled={loading}>
        {loading && <Spinner />}
        {loading ? 'Enviando…' : 'Enviar instrucciones'}
      </button>
      <div className={styles.links}>
        <Link to="/" className={styles.link}>
          Volver a iniciar sesión
        </Link>
      </div>
    </form>
  )
}

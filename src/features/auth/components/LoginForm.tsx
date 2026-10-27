import { useEffect, useRef, type FormEvent } from 'react'
import { useLoginForm } from '../hooks/useLoginForm'
import type { AuthGateway } from '../types'
import { FormFeedback } from './FormFeedback'
import { GoogleIcon } from './GoogleIcon'
import { PasswordField } from './PasswordField'
import { Spinner } from './Spinner'
import { TextField } from './TextField'
import styles from './buttons.module.css'
import formStyles from './login-form.module.css'

export function LoginForm({ gateway }: { readonly gateway: AuthGateway }) {
  const { values, errors, status, invalidTick, setField, run } = useLoginForm(gateway)
  const formRef = useRef<HTMLFormElement>(null)
  const loading = status.kind === 'loading'

  useEffect(() => {
    if (invalidTick === 0) return
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [invalidTick])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void run('sign-in')
  }

  return (
    <form ref={formRef} className={formStyles.form} onSubmit={onSubmit} noValidate aria-busy={loading}>
      <TextField
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="nombre@dominio.com"
        value={values.email}
        error={errors.email}
        onChange={(e) => setField('email', e.target.value)}
      />
      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="current-password"
        placeholder="Tu contraseña"
        value={values.password}
        error={errors.password}
        onChange={(e) => setField('password', e.target.value)}
      />
      <FormFeedback status={status} />
      <button type="submit" className={styles.primary} disabled={loading}>
        {status.kind === 'loading' && status.action === 'sign-in' && <Spinner />}
        {loading && status.action === 'sign-in' ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
      <div className={styles.divider}>o</div>
      <button type="button" className={styles.google} disabled={loading} onClick={() => void run('google')}>
        {status.kind === 'loading' && status.action === 'google' ? <Spinner /> : <GoogleIcon />}
        Continuar con Google
      </button>
      <div className={styles.links}>
        <button type="button" className={styles.link} disabled={loading} onClick={() => void run('reset')}>
          Recuperar contraseña
        </button>
        <button type="button" className={styles.link} disabled={loading} onClick={() => void run('sign-up')}>
          Crear cuenta
        </button>
      </div>
    </form>
  )
}

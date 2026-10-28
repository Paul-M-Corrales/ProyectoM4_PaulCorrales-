import { useRef, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useFocusFirstInvalid } from '../hooks/useFocusFirstInvalid'
import { useRegisterForm } from '../hooks/useRegisterForm'
import type { AuthGateway } from '../types'
import { FormFeedback } from './FormFeedback'
import { GoogleIcon } from './GoogleIcon'
import { PasswordField } from './PasswordField'
import { Spinner } from './Spinner'
import { TextField } from './TextField'
import styles from './buttons.module.css'
import formStyles from './login-form.module.css'

export function RegisterForm({ gateway }: { readonly gateway: AuthGateway }) {
  const { values, errors, status, invalidTick, setField, submit, google } = useRegisterForm(gateway)
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
        value={values.email}
        error={errors.email}
        onChange={(e) => setField('email', e.target.value)}
      />
      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="new-password"
        placeholder="Al menos 8 caracteres"
        value={values.password}
        error={errors.password}
        onChange={(e) => setField('password', e.target.value)}
      />
      <PasswordField
        label="Repetir contraseña"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Repetí tu contraseña"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(e) => setField('confirmPassword', e.target.value)}
      />
      <FormFeedback status={status} />
      <button type="submit" className={styles.primary} disabled={loading}>
        {loading && status.action === 'sign-up' && <Spinner />}
        {loading && status.action === 'sign-up' ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
      <div className={styles.divider}>o</div>
      <button type="button" className={styles.google} disabled={loading} onClick={() => void google()}>
        {loading && status.action === 'google' ? <Spinner /> : <GoogleIcon />}
        Continuar con Google
      </button>
      <div className={styles.links}>
        <Link to="/" className={styles.link}>
          Ya tengo cuenta
        </Link>
      </div>
    </form>
  )
}

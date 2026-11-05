import { useContext } from 'react'
import { Button } from '@/components/ui/Button'
import { EmailVerificationContext } from '../context/emailVerificationContext'
import { useEmailVerification } from '../hooks/useEmailVerification'
import styles from './verify-email-notice.module.css'

interface Props {
  readonly onVerified: () => void
}

export const VERIFY_TITLE = 'Verificá tu correo electrónico'
const REQUIRED =
  'Confirmá tu dirección antes de acceder a las funciones que requieren verificación, como el resumen por correo.'
export const SENT =
  'Te enviamos un enlace de verificación. Revisá tu bandeja de entrada y también las carpetas de Spam o Correo no deseado.'
const SLOW = 'Puede tardar unos minutos en llegar.'
const PENDING = 'Todavía no figura como verificado. Abrí el enlace del correo y probá de nuevo.'

/** Tarjeta visible para cuentas Email/Contraseña sin verificar. El correo lo envía Firebase Authentication (no SES). */
export function VerifyEmailNotice({ onVerified }: Props) {
  const service = useContext(EmailVerificationContext)
  const { state, send, check, secondsLeft } = useEmailVerification(service, onVerified)
  const email = service.email()
  const busy = state.kind === 'sending' || state.kind === 'checking'
  const waiting = secondsLeft > 0

  return (
    <section className={styles.card} aria-labelledby="verify-email-title">
      <h2 id="verify-email-title" className={styles.title}>{VERIFY_TITLE}</h2>
      {email && <p className={styles.email}>Cuenta: <strong>{email}</strong></p>}
      <p className={styles.text}>{REQUIRED}</p>
      <div className={styles.status} role="status" aria-live="polite">
        {state.kind === 'sending' && <p>Enviando el enlace de verificación…</p>}
        {state.kind === 'checking' && <p>Comprobando tu verificación…</p>}
        {state.kind === 'sent' && (
          <>
            <p>{SENT}</p>
            <p className={styles.hint}>{SLOW}</p>
          </>
        )}
        {state.kind === 'pending' && <p>{PENDING}</p>}
      </div>
      {state.kind === 'error' && <p className={styles.error} role="alert">{state.message}</p>}
      <div className={styles.actions}>
        <Button variant="outline" disabled={busy || waiting} aria-busy={state.kind === 'sending'} onClick={() => void send()}>
          {state.kind === 'sending' ? 'Enviando…' : waiting ? `Reenviar correo (${secondsLeft} s)` : 'Reenviar correo'}
        </Button>
        <Button disabled={busy} aria-busy={state.kind === 'checking'} onClick={() => void check()}>
          {state.kind === 'checking' ? 'Comprobando…' : 'Ya verifiqué mi correo'}
        </Button>
      </div>
    </section>
  )
}

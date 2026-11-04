import { useContext } from 'react'
import { Button } from '@/components/ui/Button'
import { EmailVerificationContext } from '../context/emailVerificationContext'
import { useEmailVerification } from '../hooks/useEmailVerification'
import styles from './summary-email-action.module.css'

interface Props {
  readonly onVerified: () => void
}

const INTRO =
  'Para recibir el resumen necesitás una cuenta con el correo verificado. Pedí el correo de verificación, abrí el enlace y volvé acá.'
const SENT =
  'Te enviamos un correo de verificación. Revisá tu bandeja de entrada y también spam; después tocá «Ya verifiqué mi correo».'
const PENDING = 'Todavía no figura como verificado. Abrí el enlace del correo y probá de nuevo.'

/** Guía a las cuentas Email/Contraseña sin verificar; el correo lo envía Firebase Authentication (no SES). */
export function VerifyEmailNotice({ onVerified }: Props) {
  const service = useContext(EmailVerificationContext)
  const { state, send, check, secondsLeft } = useEmailVerification(service, onVerified)
  const busy = state.kind === 'sending' || state.kind === 'checking'
  const waiting = secondsLeft > 0
  const sentOnce = state.kind === 'sent' || state.kind === 'pending' || waiting

  return (
    <div className={styles.verify}>
      <p className={styles.note} role="status">{INTRO}</p>
      <div className={styles.row}>
        <Button variant="outline" disabled={busy || waiting} aria-busy={state.kind === 'sending'} onClick={() => void send()}>
          {state.kind === 'sending'
            ? 'Enviando…'
            : waiting ? `Reenviar en ${secondsLeft} s` : sentOnce ? 'Reenviar correo de verificación' : 'Enviar correo de verificación'}
        </Button>
        <Button variant="outline" disabled={busy} aria-busy={state.kind === 'checking'} onClick={() => void check()}>
          {state.kind === 'checking' ? 'Comprobando…' : 'Ya verifiqué mi correo'}
        </Button>
      </div>
      {state.kind === 'sent' && <p className={styles.ok} role="status">{SENT}</p>}
      {state.kind === 'pending' && <p className={styles.note} role="status">{PENDING}</p>}
      {state.kind === 'error' && <p className={styles.error} role="alert">{state.message}</p>}
    </div>
  )
}

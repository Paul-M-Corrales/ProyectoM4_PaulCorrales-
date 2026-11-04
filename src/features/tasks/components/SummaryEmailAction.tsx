import { useCallback, useContext, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { SummaryEmailContext } from '../context/summaryEmailContext'
import { useSummaryEmail } from '../hooks/useSummaryEmail'
import { VerifyEmailNotice } from './VerifyEmailNotice'
import styles from './summary-email-action.module.css'

const ACCEPTED =
  'Solicitud aceptada: el resumen se envió a tu correo. Puede tardar unos minutos y no garantizamos que llegue a la bandeja de entrada; revisá también spam.'

/** Botón «Enviar resumen por correo». El destinatario lo decide el servidor (correo verificado de tu cuenta). */
export function SummaryEmailAction() {
  const service = useContext(SummaryEmailContext)
  const { state, send } = useSummaryEmail(service)
  const [verified, setVerified] = useState(() => service.isEmailVerified())
  const markVerified = useCallback(() => setVerified(true), [])
  const unverified = verified === false
  const sending = state.kind === 'sending'

  return (
    <div className={styles.row}>
      <Button
        variant="outline"
        disabled={unverified}
        aria-disabled={unverified || sending}
        aria-busy={sending}
        onClick={() => void send()}
      >
        {sending ? 'Enviando…' : 'Enviar resumen por correo'}
      </Button>
      {unverified && <VerifyEmailNotice onVerified={markVerified} />}
      {state.kind === 'accepted' && <p className={styles.ok} role="status">{ACCEPTED}</p>}
      {state.kind === 'error' && <p className={styles.error} role="alert">{state.message}</p>}
    </div>
  )
}

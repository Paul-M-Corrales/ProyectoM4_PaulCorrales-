import { useContext } from 'react'
import { EmailGateContext } from '../context/emailGateContext'
import { VerifyEmailNotice } from './VerifyEmailNotice'
import styles from './verification-banner.module.css'

/** Franja bajo la barra superior: tarjeta de verificación o, al terminar, la confirmación. */
export function VerificationBanner() {
  const gate = useContext(EmailGateContext)
  if (!gate.unverified && !gate.justVerified) return null
  return (
    <div className={styles.banner}>
      {gate.unverified ? (
        <VerifyEmailNotice onVerified={gate.markVerified} />
      ) : (
        <p className={styles.done} role="status">Correo verificado. Ya podés enviar el resumen por correo.</p>
      )}
    </div>
  )
}

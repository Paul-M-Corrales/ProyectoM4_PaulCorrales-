import { useCallback, useContext, useState } from 'react'
import { SummaryEmailContext } from '../context/summaryEmailContext'

/** Estado de verificación de la cuenta actual. Solo `false` explícito pide verificar (Google ya llega verificada). */
export function useEmailVerified() {
  const service = useContext(SummaryEmailContext)
  const [verified, setVerified] = useState(() => service.isEmailVerified())
  const [justVerified, setJustVerified] = useState(false)
  const markVerified = useCallback(() => {
    setVerified(true)
    setJustVerified(true)
  }, [])
  return { unverified: verified === false, justVerified, markVerified }
}

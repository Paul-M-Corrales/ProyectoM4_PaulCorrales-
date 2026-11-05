import { useMemo, type ReactNode } from 'react'
import { EmailGateContext } from '../context/emailGateContext'
import { useEmailVerified } from '../hooks/useEmailVerified'

/** Un único estado de verificación para toda el área privada (aviso, botón del resumen y mensaje de confirmación). */
export function EmailGateProvider({ children }: { readonly children: ReactNode }) {
  const { unverified, justVerified, markVerified } = useEmailVerified()
  const value = useMemo(() => ({ unverified, justVerified, markVerified }), [unverified, justVerified, markVerified])
  return <EmailGateContext value={value}>{children}</EmailGateContext>
}

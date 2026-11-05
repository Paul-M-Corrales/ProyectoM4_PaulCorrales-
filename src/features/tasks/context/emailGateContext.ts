import { createContext } from 'react'

export interface EmailGate {
  /** true solo cuando la cuenta está explícitamente sin verificar (Google ya llega verificada). */
  readonly unverified: boolean
  /** true tras confirmar la verificación en esta sesión de pantalla. */
  readonly justVerified: boolean
  readonly markVerified: () => void
}

/** Sin proveedor (tests aislados) no hay bloqueo: el servidor sigue exigiendo el correo verificado. */
export const EmailGateContext = createContext<EmailGate>({
  unverified: false,
  justVerified: false,
  markVerified: () => {},
})

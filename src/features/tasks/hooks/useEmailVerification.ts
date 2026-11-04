import { useCallback, useEffect, useRef, useState } from 'react'
import type { EmailVerificationService } from '../services/emailVerificationService'

/** Espera mínima entre reenvíos desde la interfaz (Firebase aplica además su propio límite). */
export const RESEND_COOLDOWN_SECONDS = 60

export type VerificationState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'sending' }
  | { readonly kind: 'sent' }
  | { readonly kind: 'checking' }
  | { readonly kind: 'pending' }
  | { readonly kind: 'error'; readonly message: string }

/** Envío y comprobación de la verificación, con cerrojo anti doble clic y cuenta atrás para reenviar. */
export function useEmailVerification(service: EmailVerificationService, onVerified: () => void) {
  const [state, setState] = useState<VerificationState>({ kind: 'idle' })
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const busy = useRef(false)

  useEffect(() => {
    if (until === 0) return undefined
    const id = setInterval(() => {
      setNow(Date.now())
      if (Date.now() >= until) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [until])

  const secondsLeft = Math.max(0, Math.ceil((until - now) / 1000))

  const run = useCallback(async (working: VerificationState, task: () => Promise<VerificationState>) => {
    if (busy.current) return
    busy.current = true
    setState(working)
    try {
      setState(await task())
    } finally {
      busy.current = false
    }
  }, [])

  const send = useCallback(
    () =>
      run({ kind: 'sending' }, async () => {
        const result = await service.send()
        if (!result.ok) return { kind: 'error', message: result.message }
        setNow(Date.now())
        setUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
        return { kind: 'sent' }
      }),
    [run, service],
  )

  const check = useCallback(
    () =>
      run({ kind: 'checking' }, async () => {
        const result = await service.refresh()
        if (!result.ok) return { kind: 'error', message: result.message }
        if (result.verified) onVerified()
        return result.verified ? { kind: 'idle' } : { kind: 'pending' }
      }),
    [run, service, onVerified],
  )

  return { state, send, check, secondsLeft }
}

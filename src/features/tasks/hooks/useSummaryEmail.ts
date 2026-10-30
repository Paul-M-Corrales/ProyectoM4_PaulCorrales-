import { useCallback, useRef, useState } from 'react'
import type { SummaryEmailService } from '../services/summaryEmailService'

export type SummaryEmailState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'sending' }
  | { readonly kind: 'accepted' }
  | { readonly kind: 'error'; readonly message: string }

/** Un envío a la vez: el cerrojo (ref) frena el doble clic antes de que React vuelva a renderizar. */
export function useSummaryEmail(service: SummaryEmailService) {
  const [state, setState] = useState<SummaryEmailState>({ kind: 'idle' })
  const busy = useRef(false)

  const send = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    setState({ kind: 'sending' })
    try {
      const result = await service.send()
      setState(result.ok ? { kind: 'accepted' } : { kind: 'error', message: result.message })
    } finally {
      busy.current = false
    }
  }, [service])

  return { state, send }
}

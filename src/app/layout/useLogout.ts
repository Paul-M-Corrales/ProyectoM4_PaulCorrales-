import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'

/** Cierra la sesión; al lograrlo el observer de auth redirige al login, así que solo se maneja el fallo. */
export function useLogout() {
  const { gateway } = useAuth()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const logout = async () => {
    if (pending) return
    setPending(true)
    setError(undefined)
    const result = await gateway.signOut()
    if (!result.ok) {
      setError(result.message)
      setPending(false)
    }
  }

  return { logout, pending, error }
}

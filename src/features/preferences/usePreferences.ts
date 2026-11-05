import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { loadPreferences, savePreferences, type TaskPreferences } from './taskPreferences'

/** Preferencias de la cuenta actual. Al cambiar de usuario se vuelven a leer las suyas, nunca las del anterior. */
export function usePreferences() {
  const { session } = useAuth()
  const uid = session.status === 'authenticated' ? session.user.uid : null
  const [version, setVersion] = useState(0)
  // `version` fuerza la relectura tras guardar.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const preferences = useMemo(() => loadPreferences(uid), [uid, version])

  const update = useCallback(
    (patch: Partial<TaskPreferences>) => {
      const saved = savePreferences(uid, { ...preferences, ...patch })
      if (saved) setVersion((current) => current + 1)
      return saved
    },
    [uid, preferences],
  )

  return { preferences, update }
}

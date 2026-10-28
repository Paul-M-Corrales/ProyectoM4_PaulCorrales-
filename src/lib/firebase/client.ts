import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import type { FirebaseWebConfig } from './config'

/**
 * Inicialización controlada: reutiliza la app existente (HMR, StrictMode) y solo
 * se invoca cuando la configuración está completa. No hay claves de Admin en el frontend.
 * Futuro: `getFirestore(getFirebaseApp(config))` se agregará aquí, sin tocar los componentes.
 */
export function getFirebaseApp(config: FirebaseWebConfig) {
  return getApps().length > 0 ? getApp() : initializeApp(config)
}

/** La persistencia de sesión la gestiona el SDK (IndexedDB); no se guardan tokens a mano. */
export function getFirebaseAuth(config: FirebaseWebConfig): Auth {
  return getAuth(getFirebaseApp(config))
}

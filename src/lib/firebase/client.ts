import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import type { FirebaseWebConfig } from './config'

/**
 * Inicialización controlada: reutiliza la app existente (HMR, StrictMode) y solo
 * se invoca cuando la configuración está completa. No hay claves de Admin en el frontend.
 */
export function getFirebaseApp(config: FirebaseWebConfig) {
  return getApps().length > 0 ? getApp() : initializeApp(config)
}

/** La persistencia de sesión la gestiona el SDK (IndexedDB); no se guardan tokens a mano. */
export function getFirebaseAuth(config: FirebaseWebConfig): Auth {
  return getAuth(getFirebaseApp(config))
}

/** Cloud Firestore de la misma app; getFirestore reutiliza la instancia si ya existe. */
export function getFirebaseDb(config: FirebaseWebConfig): Firestore {
  return getFirestore(getFirebaseApp(config))
}

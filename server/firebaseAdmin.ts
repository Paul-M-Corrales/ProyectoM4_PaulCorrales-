import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { ServerConfig } from './env.js'

function adminApp({ firebase }: ServerConfig): App {
  return (
    getApps()[0] ??
    initializeApp({
      projectId: firebase.projectId,
      credential: cert({
        projectId: firebase.projectId,
        clientEmail: firebase.clientEmail,
        privateKey: firebase.privateKey,
      }),
    })
  )
}

/** Firebase Admin solo existe en el servidor; verifyIdToken valida firma, caducidad y proyecto (aud). */
export function createAdmin(config: ServerConfig) {
  const app = adminApp(config)
  return { auth: getAuth(app), db: getFirestore(app) }
}

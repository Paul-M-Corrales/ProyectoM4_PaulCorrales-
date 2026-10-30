import type { Firestore } from 'firebase-admin/firestore'
import type { Reservation } from './types.js'

export const COOLDOWN_SECONDS = 60
export const DAILY_LIMIT = 5

interface Stored {
  readonly lastSentAt?: number
  readonly day?: string
  readonly count?: number
}

/**
 * Límite persistente por usuario (válido entre instancias serverless) en `emailRateLimits/{uid}`.
 * La transacción hace la reserva atómica: un doble clic o dos pestañas no pueden colarse a la vez.
 * Esa colección no tiene reglas para clientes, así que el cliente web no puede leerla ni escribirla.
 */
export function createRateLimiter(db: Firestore, now: () => number = Date.now) {
  return (uid: string): Promise<Reservation> => {
    const ref = db.collection('emailRateLimits').doc(uid)
    return db.runTransaction(async (tx): Promise<Reservation> => {
      const current = (await tx.get(ref)).data() as Stored | undefined
      const time = now()
      const day = new Date(time).toISOString().slice(0, 10)
      const sinceLast = current?.lastSentAt === undefined ? Infinity : (time - current.lastSentAt) / 1000
      if (sinceLast < COOLDOWN_SECONDS) {
        return { allowed: false, retryAfterSeconds: Math.ceil(COOLDOWN_SECONDS - sinceLast) }
      }
      const count = current?.day === day ? (current.count ?? 0) : 0
      if (count >= DAILY_LIMIT) {
        const tomorrow = Date.parse(`${day}T00:00:00Z`) + 86_400_000
        return { allowed: false, retryAfterSeconds: Math.ceil((tomorrow - time) / 1000) }
      }
      tx.set(ref, { lastSentAt: time, day, count: count + 1 })
      return { allowed: true }
    })
  }
}

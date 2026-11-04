export type Priority = 'alta' | 'media' | 'baja'

export interface SummaryTask {
  readonly title: string
  readonly priority: Priority
  /** AAAA-MM-DD o null. */
  readonly dueDate: string | null
  readonly completed: boolean
}

/** Identidad ya verificada por Firebase Admin; nunca proviene del cuerpo ni de parámetros de la solicitud. */
export interface VerifiedToken {
  readonly uid: string
  readonly email: string | null
  readonly emailVerified: boolean
  readonly name: string | null
}

/** Contadores globales exactos + candidatas pendientes (acotadas) para la lista del correo. */
export interface TasksSnapshot {
  readonly total: number
  readonly completed: number
  readonly pending: number
  readonly unknown: number
  readonly candidates: readonly SummaryTask[]
}

export interface OutgoingEmail {
  readonly to: string
  readonly subject: string
  readonly html: string
  readonly text: string
}

/** Adaptador de envío: AWS SES en producción, un doble en los tests. */
export interface EmailSender {
  send(email: OutgoingEmail): Promise<void>
}

export type Reservation =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retryAfterSeconds: number }

export interface Deps {
  verifyToken(token: string): Promise<VerifiedToken>
  loadTasks(uid: string): Promise<TasksSnapshot>
  /** Reserva atómica y persistente del envío (frecuencia por usuario). */
  reserveSend(uid: string): Promise<Reservation>
  readonly sender: EmailSender
  readonly allowedOrigins: readonly string[]
}

export type ErrorCode =
  | 'method_not_allowed'
  | 'forbidden_origin'
  | 'unauthorized'
  | 'email_not_verified'
  | 'rate_limited'
  | 'not_configured'
  | 'send_failed'
  | 'internal'

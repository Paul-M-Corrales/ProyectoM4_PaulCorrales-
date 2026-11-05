const KEY = 'ongoing.verification-sent'

/** Recuerda (solo en esta pestaña) a qué cuenta ya se le envió el enlace, para no reenviarlo en cada recarga. */
export function wasVerificationSent(email: string | null): boolean {
  if (email === null) return false
  try {
    return sessionStorage.getItem(KEY) === email
  } catch {
    return false
  }
}

export function markVerificationSent(email: string | null): void {
  if (email === null) return
  try {
    sessionStorage.setItem(KEY, email)
  } catch {
    // Sin almacenamiento (modo privado estricto): el único costo es poder reenviar tras recargar.
  }
}

const ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Todo texto de usuario pasa por aquí antes de entrar al HTML del correo. */
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char)

/** AAAA-MM-DD -> DD/MM/AAAA; cualquier otra cosa se descarta. */
export function formatDate(value: string | null): string | null {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null
}

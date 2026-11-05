import { SORT_KEYS, type SortKey } from '@/features/tasks/logic/sortTasks'

/**
 * Preferencias de Mis tareas. Alcance: este navegador/dispositivo, una entrada por cuenta (uid).
 * No viajan a otros dispositivos: guardarlas en Firestore exigiría ampliar las reglas de seguridad.
 * La vista «Tablero» todavía no existe, por eso solo se guarda el orden.
 */
export interface TaskPreferences {
  readonly sort: SortKey
}

export const DEFAULT_PREFERENCES: TaskPreferences = { sort: 'due' }

type Store = Pick<Storage, 'getItem' | 'setItem'>

const keyOf = (uid: string) => `ongoing.preferences.v1.${uid}`

function browserStorage(): Store | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const isSortKey = (value: unknown): value is SortKey =>
  typeof value === 'string' && (SORT_KEYS as readonly string[]).includes(value)

/** Lee y valida; ante datos ausentes, corruptos o de otro formato vuelve a los valores por defecto. */
export function loadPreferences(uid: string | null, store: Store | null = browserStorage()): TaskPreferences {
  if (uid === null || store === null) return DEFAULT_PREFERENCES
  try {
    const raw: unknown = JSON.parse(store.getItem(keyOf(uid)) ?? 'null')
    const sort = typeof raw === 'object' && raw !== null && 'sort' in raw ? raw.sort : null
    return isSortKey(sort) ? { sort } : DEFAULT_PREFERENCES
  } catch {
    return DEFAULT_PREFERENCES
  }
}

/** true si se guardó; false sin sesión o sin almacenamiento disponible (modo privado, cuota). */
export function savePreferences(uid: string | null, prefs: TaskPreferences, store: Store | null = browserStorage()): boolean {
  if (uid === null || store === null || !isSortKey(prefs.sort)) return false
  try {
    store.setItem(keyOf(uid), JSON.stringify({ sort: prefs.sort }))
    return true
  } catch {
    return false
  }
}

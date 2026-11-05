import { useState } from 'react'
import { usePreferences } from '@/features/preferences/usePreferences'
import { SORT_KEYS, SORT_LABELS, type SortKey } from '@/features/tasks/logic/sortTasks'
import styles from './cards.module.css'

/** Única preferencia con efecto real hoy: el orden con el que arranca Mis tareas. */
export function PreferencesPanel() {
  const { preferences, update } = usePreferences()
  const [result, setResult] = useState<'saved' | 'failed' | null>(null)

  return (
    <section className={styles.panel} aria-labelledby="prefs-title">
      <h2 id="prefs-title">Preferencias de Mis tareas</h2>
      <label className={styles.field}>
        Orden predeterminado
        <select
          value={preferences.sort}
          onChange={(event) => setResult(update({ sort: event.target.value as SortKey }) ? 'saved' : 'failed')}
        >
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>{SORT_LABELS[key]}</option>
          ))}
        </select>
      </label>
      <p className={styles.hint}>
        Se aplica al abrir Mis tareas. Se guarda en este navegador para tu cuenta: no se sincroniza entre dispositivos.
      </p>
      <div role="status">{result === 'saved' && <p>Preferencia guardada.</p>}</div>
      {result === 'failed' && (
        <p role="alert">No pudimos guardar la preferencia en este navegador (almacenamiento no disponible).</p>
      )}
    </section>
  )
}

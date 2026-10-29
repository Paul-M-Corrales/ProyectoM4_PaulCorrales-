import { progressRatio, type TaskProgress } from '@/features/mascot'

export interface PanelMessage {
  readonly badge: string
  readonly text: string
}

/** Mensaje motivacional derivado del progreso real; sin tareas no promete avances. */
export function panelMessage(progress: TaskProgress): PanelMessage {
  const ratio = progressRatio(progress)
  if (progress.total === 0) return { badge: '¡Vamos!', text: 'Crea tu primera tarea y arranca el pedaleo.' }
  if (ratio === 0) return { badge: '¡A pedalear!', text: 'Completa una tarea para poner en marcha la bici.' }
  if (ratio === 1) return { badge: '¡Objetivo cumplido!', text: 'Completaste todas tus tareas. ¡Celebremos!' }
  return { badge: '¡Vas muy bien!', text: 'Cada tarea completada te acerca a tus metas.' }
}

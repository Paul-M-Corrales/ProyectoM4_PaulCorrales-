import type { Announcements } from '@dnd-kit/core'
import type { Task } from '../types'

export const DRAG_INSTRUCTIONS =
  'Para reordenar, pulsá Espacio sobre el asa, movete con las flechas arriba y abajo, y volvé a pulsar Espacio para soltar. Escape cancela.'

/** Mensajes en español para lectores de pantalla; usan el título y la posición en la lista visible. */
export function dragAnnouncements(tasks: readonly Task[]): Announcements {
  const name = (id: string | number) => `«${tasks.find((task) => task.id === id)?.title ?? 'tarea'}»`
  const place = (id: string | number) => `posición ${tasks.findIndex((task) => task.id === id) + 1} de ${tasks.length}`
  return {
    onDragStart: ({ active }) => `Tomaste ${name(active.id)}, ${place(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${name(active.id)} está sobre la ${place(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) => (over ? `Soltaste ${name(active.id)} en la ${place(over.id)}.` : `${name(active.id)} volvió a su lugar.`),
    onDragCancel: ({ active }) => `Cancelaste el movimiento de ${name(active.id)}.`,
  }
}

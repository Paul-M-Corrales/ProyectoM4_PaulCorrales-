import {
  DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Icon } from '@/components/ui/Icon'
import type { Task } from '../types'
import { dragAnnouncements, DRAG_INSTRUCTIONS } from './dragAnnouncements'
import { TaskCard } from './TaskCard'
import styles from './sortable-list.module.css'

interface Handlers {
  readonly onToggle: (task: Task) => void
  readonly onEdit: (task: Task) => void
  readonly onDelete: (task: Task) => void
}

function SortableCard({ task, ...handlers }: { readonly task: Task } & Handlers) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      className={styles.handle}
      aria-label={`Reordenar «${task.title}»`}
      {...attributes}
      {...listeners}
    >
      <Icon name="grip" size={18} />
    </button>
  )
  const style = { transform: CSS.Translate.toString(transform), transition }
  return <TaskCard task={task} {...handlers} sortable={{ rootRef: setNodeRef, style, handle, dragging: isDragging }} />
}

interface Props extends Handlers {
  readonly tasks: readonly Task[]
  /** Mueve `activeId` a la posición de `overId` dentro de `tasks`. */
  readonly onReorder: (activeId: string, overId: string) => void
}

/** Lista única (sin grupos por fecha) que se reordena arrastrando el asa, con dedo o con teclado. */
export function SortableTaskList({ tasks, onReorder, ...handlers }: Props) {
  // El arrastre solo nace en el asa; el dedo exige una pulsación corta para no robar el scroll.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id))
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{ announcements: dragAnnouncements(tasks), screenReaderInstructions: { draggable: DRAG_INSTRUCTIONS } }}
    >
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul className={styles.list} aria-label="Tareas en orden personalizado">
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} {...handlers} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

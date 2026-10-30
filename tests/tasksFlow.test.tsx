import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { memoryRepository, task } from './tasks/memoryRepository'
import { openTasks } from './tasks/openTasks'

const ring = () => screen.getByRole('progressbar', { name: 'Tareas completadas' })

describe('Mis tareas con repositorio real (contrato Firestore)', () => {
  it('muestra el estado de carga y luego las tareas recibidas', async () => {
    openTasks(memoryRepository([task('a', { title: 'Estudiar' })]))
    expect(await screen.findByText('Estudiar')).toBeInTheDocument()
    expect(screen.queryByText('Cargando tus tareas…')).not.toBeInTheDocument()
  })

  it('crea una tarea, cierra el formulario solo tras aceptarla y actualiza contadores', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository()
    openTasks(repo)
    await user.click(await screen.findByRole('button', { name: /Nueva tarea/ }))
    await user.type(screen.getByRole('textbox', { name: /^Título/ }), 'Leer reglas')
    await user.selectOptions(screen.getByRole('combobox', { name: /Prioridad/ }), 'alta')
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))
    expect(await screen.findByText('Leer reglas')).toBeInTheDocument()
    expect(repo.calls.create).toEqual([expect.objectContaining({ title: 'Leer reglas', priority: 'alta' })])
    expect(screen.queryByRole('heading', { name: 'Nueva tarea' })).not.toBeInTheDocument()
    expect(ring()).toHaveTextContent('0/1')
  })

  it('mantiene el formulario abierto y muestra el error si el guardado falla', async () => {
    const user = userEvent.setup()
    openTasks(memoryRepository([], { ok: false, message: 'No tenés permiso para esta operación.' }))
    await user.click(await screen.findByRole('button', { name: /Nueva tarea/ }))
    await user.type(screen.getByRole('textbox', { name: /^Título/ }), 'X')
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))
    expect(await screen.findByText(/No tenés permiso/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nueva tarea' })).toBeInTheDocument()
  })

  it('completar y desmarcar actualiza el progreso real', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository([task('a'), task('b')])
    openTasks(repo)
    const box = await screen.findByRole('checkbox', { name: /Marcar «Tarea a»/ })
    expect(ring()).toHaveAttribute('aria-valuenow', '0')
    await user.click(box)
    expect(ring()).toHaveAttribute('aria-valuenow', '50')
    expect(ring()).toHaveTextContent('1/2')
    await user.click(screen.getByRole('checkbox', { name: /Marcar «Tarea b»/ }))
    expect(ring()).toHaveAttribute('aria-valuenow', '100')
    await user.click(screen.getByRole('checkbox', { name: /Marcar «Tarea a» como pendiente/ }))
    expect(ring()).toHaveAttribute('aria-valuenow', '50')
    expect(repo.calls.update).toHaveLength(3)
  })

  it('edita una tarea existente', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository([task('a', { title: 'Vieja' })])
    openTasks(repo)
    await user.click(await screen.findByRole('button', { name: /Editar «Vieja»/ }))
    const title = screen.getByRole('textbox', { name: /^Título/ })
    await user.clear(title)
    await user.type(title, 'Nueva')
    await user.click(screen.getByRole('button', { name: 'Guardar tarea' }))
    expect(await screen.findByText('Nueva')).toBeInTheDocument()
    expect(repo.calls.update).toEqual([{ id: 'a', changes: expect.objectContaining({ title: 'Nueva' }) }])
  })

  it('elimina con confirmación y respeta la negativa', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository([task('a', { title: 'Borrar' })])
    openTasks(repo)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    await user.click(await screen.findByRole('button', { name: /Eliminar «Borrar»/ }))
    expect(repo.calls.remove).toEqual([])
    await user.click(screen.getByRole('button', { name: /Eliminar «Borrar»/ }))
    expect(repo.calls.remove).toEqual(['a'])
    expect(await screen.findByText('Tarea eliminada.')).toBeInTheDocument()
    expect(screen.queryByText('Borrar')).not.toBeInTheDocument()
    confirm.mockRestore()
  })

})

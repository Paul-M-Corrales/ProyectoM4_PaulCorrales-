import { readFileSync } from 'node:fs'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { memoryRepository, task } from './tasks/memoryRepository'
import { openTasks } from './tasks/openTasks'

const trash = (title: string) => screen.findByRole('button', { name: new RegExp(`Eliminar «${title}»`) })

describe('Eliminar tarea desde la papelera', () => {
  afterEach(() => vi.restoreAllMocks())

  it('cancelar la confirmación no elimina nada', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository([task('a', { title: 'Borrar' })])
    openTasks(repo)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(await trash('Borrar'))
    expect(confirm).toHaveBeenCalledOnce()
    expect(repo.calls.remove).toEqual([])
    expect(screen.getByText('Borrar')).toBeInTheDocument()
  })

  it('confirmar elimina, actualiza contadores y avisa', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository([task('a', { title: 'Borrar' }), task('b', { title: 'Queda', completed: true })])
    openTasks(repo)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(await trash('Borrar'))
    expect(repo.calls.remove).toEqual(['a'])
    expect(await screen.findByText('Tarea eliminada.')).toBeInTheDocument()
    expect(screen.queryByText('Borrar')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Tareas completadas' })).toHaveTextContent('1/1')
  })

  it('si el repositorio falla muestra el error y no anuncia éxito', async () => {
    const user = userEvent.setup()
    const message = 'No tenés permiso para esta operación.'
    const repo = memoryRepository([task('a', { title: 'Borrar' })], { ok: false, message })
    openTasks(repo)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(await trash('Borrar'))
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(screen.queryByText('Tarea eliminada.')).not.toBeInTheDocument()
    expect(screen.getByText('Borrar')).toBeInTheDocument()
  })

  it('al volver a consultar (F5) la tarea eliminada no reaparece', async () => {
    const user = userEvent.setup()
    const repo = memoryRepository([task('a', { title: 'Borrar' })])
    const { unmount } = { unmount: () => undefined, ...openTasks(repo) }
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(await trash('Borrar'))
    await screen.findByText('Tarea eliminada.')
    unmount()
    document.body.innerHTML = ''
    openTasks(repo)
    expect(await screen.findByText(/Todavía no tenés tareas|No hay tareas|Sin tareas|no tenés/i)).toBeInTheDocument()
    expect(screen.queryByText('Borrar')).not.toBeInTheDocument()
  })

  it('el conejo no intercepta clics: el lienzo de R3F no puede tapar la papelera', () => {
    const css = readFileSync('src/features/tasks/panel/ride-panel.module.css', 'utf8')
    expect(css).toMatch(/\.mascot \*\s*\{[^}]*pointer-events:\s*none\s*!important/)
  })
})

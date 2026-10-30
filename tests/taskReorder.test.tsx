import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { memoryRepository, task } from './tasks/memoryRepository'
import { openTasks } from './tasks/openTasks'

const tasks = () => [
  task('a', { title: 'Alfa', order: 10, createdAt: 1, dueDate: '2030-01-01' }),
  task('b', { title: 'Beta', order: 20, createdAt: 2, completed: true }),
  task('c', { title: 'Gamma', order: 30, createdAt: 3, dueDate: '2020-01-01' }),
]
const list = () => screen.getByRole('list', { name: /orden personalizado/ })
const titles = () => within(list()).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)

/** jsdom no calcula layout: se apilan las tarjetas para que el teclado de dnd-kit pueda comparar posiciones. */
function stackRects() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const items = [...document.querySelectorAll('ul[aria-label*="personalizado"] > li')]
    const top = Math.max(0, items.indexOf(this as HTMLLIElement)) * 60
    return { top, bottom: top + 50, left: 0, right: 300, width: 300, height: 50, x: 0, y: top, toJSON: () => ({}) }
  })
}

async function custom(repo = memoryRepository(tasks())) {
  const user = userEvent.setup()
  openTasks(repo)
  await user.selectOptions(await screen.findByRole('combobox', { name: /Ordenar por/ }), 'custom')
  return { user, repo }
}

const drag = (name: string) => screen.getByRole('button', { name: `Reordenar «${name}»` })

describe('Orden Personalizado', () => {
  afterEach(() => vi.restoreAllMocks())

  it('muestra una lista única por order, sin agrupar por fecha', async () => {
    await custom()
    expect(titles()).toEqual(['Alfa', 'Beta', 'Gamma'])
    expect(screen.queryByRole('heading', { name: 'Vencidas' })).not.toBeInTheDocument()
  })

  it('en los demás órdenes conserva los grupos y el asa no está activa', async () => {
    const user = userEvent.setup()
    openTasks(memoryRepository(tasks()))
    expect(await screen.findByRole('heading', { name: 'Vencidas' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reordenar «/ })).not.toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: /Ordenar por/ }), 'custom')
    expect(screen.getAllByRole('button', { name: /Reordenar «/ })).toHaveLength(3)
  })

  it('reordena con el teclado, persiste y refleja el orden', async () => {
    stackRects()
    const { user, repo } = await custom()
    drag('Alfa').focus()
    await user.keyboard('[Space][ArrowDown][Space]')
    expect(await screen.findByText('Orden guardado.')).toBeInTheDocument()
    expect(repo.calls.reorder).toEqual([[{ id: 'b', order: 10 }, { id: 'a', order: 20 }]])
    expect(titles()).toEqual(['Beta', 'Alfa', 'Gamma'])
    expect(repo.calls.update).toEqual([])
  })

  it('soltar sin mover no escribe nada', async () => {
    stackRects()
    const { user, repo } = await custom()
    drag('Alfa').focus()
    await user.keyboard('[Space][Space]')
    expect(repo.calls.reorder).toEqual([])
  })

  it('muestra el error si no se pudo guardar y el orden no cambia', async () => {
    stackRects()
    const { user } = await custom(memoryRepository(tasks(), { ok: false, message: 'Sin permiso.' }))
    drag('Alfa').focus()
    await user.keyboard('[Space][ArrowDown][Space]')
    expect(await screen.findByText('Sin permiso.')).toBeInTheDocument()
    expect(titles()).toEqual(['Alfa', 'Beta', 'Gamma'])
  })

  it('con filtro activo solo se reordenan las visibles y las ocultas no se tocan', async () => {
    stackRects()
    const { user, repo } = await custom()
    await user.click(screen.getByRole('button', { name: /Pendientes/ }))
    expect(titles()).toEqual(['Alfa', 'Gamma'])
    drag('Alfa').focus()
    await user.keyboard('[Space][ArrowDown][Space]')
    await screen.findByText('Orden guardado.')
    expect(repo.calls.reorder).toEqual([[{ id: 'c', order: 10 }, { id: 'a', order: 30 }]])
  })

  it('refleja cambios de otra pestaña y convive con completar, editar y eliminar', async () => {
    const { user, repo } = await custom()
    const [a, b, c] = tasks()
    act(() => repo.push([c!, a!, b!].map((x, i) => ({ ...x, order: i + 1 }))))
    expect(titles()).toEqual(['Gamma', 'Alfa', 'Beta'])
    await user.click(screen.getByRole('checkbox', { name: /«Gamma»/ }))
    expect(repo.calls.update).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /Editar «Alfa»/ }))
    expect(screen.getByRole('textbox', { name: /^Título/ })).toHaveValue('Alfa')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: /Eliminar «Beta»/ }))
    expect(repo.calls.remove).toEqual(['b'])
    expect(repo.calls.reorder).toEqual([])
  })

  it('al quedar sin tareas (p. ej. otro usuario) no hay lista', async () => {
    const { repo } = await custom()
    act(() => repo.push([]))
    expect(screen.queryByRole('list', { name: /orden personalizado/ })).not.toBeInTheDocument()
  })
})

import { createSummaryEmailHandler } from '../../server/handler'
import { buildSummary, MAX_LISTED } from '../../server/summary'
import { createTasksLoader, LIST_POOL, MAX_TITLE } from '../../server/tasksSource'
import { fakeFirestore, manyTasks, type FakeOptions } from './fakeFirestore'
import { fakeDeps, ME, post } from './helpers'

const PATH = `users/${ME.uid}/tasks`
const load = (docs: Record<string, unknown>[], options?: FakeOptions) => {
  const { db, calls } = fakeFirestore({ [PATH]: docs }, options)
  return { calls, snapshot: () => createTasksLoader(db)(ME.uid) }
}

describe('contadores globales exactos (sin tope de 500)', () => {
  it.each([0, 1, 25, 499, 500, 501, 1000])('%i tareas pendientes: total, pendientes y lista acotada', async (n) => {
    const { snapshot } = load(manyTasks(n, false))
    const summary = buildSummary(await snapshot())
    expect(summary).toMatchObject({ total: n, completed: 0, pending: n, unknown: 0, percent: 0 })
    expect(summary.listed).toHaveLength(Math.min(n, MAX_LISTED))
    expect(summary.hidden).toBe(n - summary.listed.length)
  })

  it.each([0, 1, 25, 499, 500, 501, 1000])('%i tareas completadas: 100% y sin lista', async (n) => {
    const summary = buildSummary(await load(manyTasks(n, true)).snapshot())
    expect(summary).toMatchObject({ total: n, completed: n, pending: 0, percent: n === 0 ? 0 : 100, hidden: 0 })
    expect(summary.listed).toEqual([])
  })

  it.each([[300, 201], [750, 250], [499, 2]])('mixto %i completadas + %i pendientes', async (done, todo) => {
    const docs = [...manyTasks(done, true, 'H'), ...manyTasks(todo, false, 'P')]
    const summary = buildSummary(await load(docs).snapshot())
    expect(summary).toMatchObject({ total: done + todo, completed: done, pending: todo })
    expect(summary.percent).toBe(Math.round((done / (done + todo)) * 100))
    expect(summary.listed.every((task) => task.title.startsWith('P'))).toBe(true)
  })

  it('1000 tareas: el listado lee a lo sumo LIST_POOL documentos y los contadores no leen documentos', async () => {
    const { calls, snapshot } = load([...manyTasks(900, true), ...manyTasks(100, false)])
    await snapshot()
    expect(calls.filter((call) => call.startsWith('count'))).toHaveLength(3)
    expect(calls.filter((call) => call.startsWith('list'))).toEqual([`list ${PATH} completed==false limit ${LIST_POOL}`])
  })
})

describe('datos antiguos y límites de tamaño', () => {
  it('declara las tareas sin `completed` booleano en lugar de contarlas como pendientes o hechas', async () => {
    const legacy = [{ title: 'vieja' }, { title: 'rara', completed: 'si' }]
    const summary = buildSummary(await load([...manyTasks(2, true), ...manyTasks(1, false), ...legacy]).snapshot())
    expect(summary).toMatchObject({ total: 5, completed: 2, pending: 1, unknown: 2 })
  })

  it('recorta títulos largos y normaliza prioridad o fecha inválidas', async () => {
    const doc = { title: 'x'.repeat(5000), priority: 'urgente', dueDate: 42, completed: false }
    const { candidates } = await load([doc]).snapshot()
    expect(candidates[0]?.title).toHaveLength(MAX_TITLE)
    expect(candidates[0]).toMatchObject({ priority: 'media', dueDate: null })
  })
})

describe('errores de consulta', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => {}))
  afterEach(() => vi.restoreAllMocks())

  it.each(['count', 'list'] as const)('un fallo de %s no envía un correo con cifras parciales', async (failOn) => {
    const { db } = fakeFirestore({ [PATH]: manyTasks(3, false) }, { failOn })
    const setup = fakeDeps({ loadTasks: createTasksLoader(db) })
    const response = await createSummaryEmailHandler(setup.provider)(post())
    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain('failed')
    expect(setup.sent).toEqual([])
  })
})

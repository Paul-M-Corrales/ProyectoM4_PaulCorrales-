import { act, renderHook } from '@testing-library/react'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { memoryRepository, task } from './tasks/memoryRepository'

const ids = (tasks: readonly { id: string }[]) => tasks.map((item) => item.id)

describe('useTasks', () => {
  it('pasa a listo con las tareas del repositorio y se actualiza en tiempo real', () => {
    const repo = memoryRepository([task('a')])
    const { result } = renderHook(() => useTasks(repo))
    expect(result.current.status).toBe('ready')
    expect(ids(result.current.tasks)).toEqual(['a'])
    act(() => repo.push([task('a'), task('b')]))
    expect(ids(result.current.tasks)).toEqual(['a', 'b'])
  })

  it('no duplica tareas cuando llegan varias actualizaciones', () => {
    const repo = memoryRepository([task('a')])
    const { result } = renderHook(() => useTasks(repo))
    act(() => repo.push([task('a', { completed: true })]))
    act(() => repo.push([task('a', { completed: true })]))
    expect(result.current.tasks).toHaveLength(1)
  })

  it('expone el error de la suscripción (permisos o conexión)', () => {
    const repo = memoryRepository()
    const { result } = renderHook(() => useTasks(repo))
    act(() => repo.fail('No tenés permiso para esta operación.'))
    expect(result.current.status).toBe('error')
    expect(result.current.loadError).toMatch(/permiso/)
    expect(result.current.tasks).toEqual([])
  })

  it('cancela el listener al desmontar', () => {
    const repo = memoryRepository()
    const { unmount } = renderHook(() => useTasks(repo))
    unmount()
    expect(repo.unsubscribed.count).toBe(1)
  })

  it('al cambiar de usuario cancela el listener anterior y descarta sus datos', () => {
    const repoA = memoryRepository([task('de-A')])
    const repoB = memoryRepository()
    const { result, rerender } = renderHook(({ repo }) => useTasks(repo), { initialProps: { repo: repoA } })
    expect(ids(result.current.tasks)).toEqual(['de-A'])
    rerender({ repo: repoB })
    expect(repoA.unsubscribed.count).toBe(1)
    expect(result.current.tasks).toEqual([])
  })

  it('delega update y remove en el repositorio', async () => {
    const repo = memoryRepository([task('a')])
    const { result } = renderHook(() => useTasks(repo))
    await act(async () => {
      await result.current.update('a', { completed: true })
      await result.current.remove('a')
    })
    expect(repo.calls.update).toEqual([{ id: 'a', changes: { completed: true } }])
    expect(repo.calls.remove).toEqual(['a'])
  })
})

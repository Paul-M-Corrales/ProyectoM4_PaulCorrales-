import { isBeforeToday, pastDueError, PAST_DUE_MESSAGE, todayLocal } from '@/features/tasks/logic/localDate'
import { validateChanges, validateDraft } from '@/features/tasks/logic/validateDraft'

const draft = { title: 'ok', description: '', priority: 'media', dueDate: null } as const
const TODAY = '2030-06-15'

describe('todayLocal e isBeforeToday', () => {
  afterEach(() => {
    delete process.env.TZ
  })

  it('usa el día del calendario local, también a las 23:59 y a las 00:00', () => {
    expect(todayLocal(new Date(2030, 5, 15, 23, 59, 59))).toBe('2030-06-15')
    expect(todayLocal(new Date(2030, 5, 16, 0, 0, 0))).toBe('2030-06-16')
    expect(todayLocal(new Date(2030, 0, 5))).toBe('2030-01-05')
  })

  it.each([
    ['America/Argentina/Buenos_Aires', '2030-01-01'],
    ['UTC', '2030-01-02'],
    ['Pacific/Auckland', '2030-01-02'],
  ])('en %s el instante 2030-01-02T01:00Z cae en el día local %s', (zone, expected) => {
    process.env.TZ = zone
    const instant = new Date('2030-01-02T01:00:00Z')
    expect(todayLocal(instant)).toBe(expected)
  })

  it('un usuario en Buenos Aires de noche no pierde «hoy» por el UTC', () => {
    process.env.TZ = 'America/Argentina/Buenos_Aires'
    const night = new Date('2030-01-02T01:00:00Z') // 22:00 del 1 de enero local
    expect(night.toISOString().slice(0, 10)).toBe('2030-01-02') // lo que daría el cálculo incorrecto
    expect(isBeforeToday('2030-01-01', todayLocal(night))).toBe(false)
    expect(isBeforeToday('2029-12-31', todayLocal(night))).toBe(true)
  })

  it('ayer es pasado; hoy y mañana no; los formatos inválidos no cuentan como pasado', () => {
    expect(isBeforeToday('2030-06-14', TODAY)).toBe(true)
    expect(isBeforeToday('2030-06-15', TODAY)).toBe(false)
    expect(isBeforeToday('2030-06-16', TODAY)).toBe(false)
    expect(isBeforeToday('5/3', TODAY)).toBe(false)
  })
})

describe('regla de vencimiento', () => {
  it('rechaza asignar una fecha pasada y admite hoy, futuro y sin vencimiento', () => {
    expect(pastDueError('2030-06-14', null, TODAY)).toBe(PAST_DUE_MESSAGE)
    expect(pastDueError('2030-06-15', null, TODAY)).toBeUndefined()
    expect(pastDueError('2031-01-01', null, TODAY)).toBeUndefined()
    expect(pastDueError(null, null, TODAY)).toBeUndefined()
  })

  it('en una edición conserva la fecha vencida original pero rechaza otra pasada', () => {
    expect(pastDueError('2030-01-01', '2030-01-01', TODAY)).toBeUndefined()
    expect(pastDueError('2030-02-02', '2030-01-01', TODAY)).toBe(PAST_DUE_MESSAGE)
    expect(pastDueError('2030-07-01', '2030-01-01', TODAY)).toBeUndefined()
    expect(pastDueError(null, '2030-01-01', TODAY)).toBeUndefined()
  })

  it('validateDraft y validateChanges aplican la regla solo si reciben el contexto', () => {
    const past = { ...draft, dueDate: '2030-06-14' }
    expect(validateDraft(past, { today: TODAY }).dueDate).toBe(PAST_DUE_MESSAGE)
    expect(validateDraft(past)).toEqual({})
    expect(validateDraft(past, { today: TODAY, original: '2030-06-14' })).toEqual({})
    expect(validateChanges({ completed: true }, { today: TODAY, original: '2030-06-14' })).toEqual({})
    expect(validateChanges({ dueDate: '2030-06-01' }, { today: TODAY, original: '2030-06-14' }).dueDate).toBe(PAST_DUE_MESSAGE)
  })
})

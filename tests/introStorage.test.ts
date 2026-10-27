import { hasPlayedIntro, markIntroPlayed } from '@/features/intro/introStorage'

describe('introStorage', () => {
  beforeEach(() => window.sessionStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('recuerda que la intro ya se reprodujo en la sesión', () => {
    expect(hasPlayedIntro()).toBe(false)
    markIntroPlayed()
    expect(hasPlayedIntro()).toBe(true)
  })

  it('no falla si sessionStorage lanza excepciones', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    expect(hasPlayedIntro()).toBe(false)
    expect(() => markIntroPlayed()).not.toThrow()
  })
})

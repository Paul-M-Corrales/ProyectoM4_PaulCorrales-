import { INTRO_STORAGE_KEY } from './introTimeline'

export function hasPlayedIntro(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1')
  } catch {
    // sessionStorage no disponible: la intro simplemente puede repetirse
  }
}

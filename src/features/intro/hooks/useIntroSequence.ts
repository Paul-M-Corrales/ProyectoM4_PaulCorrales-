import { useEffect, useState } from 'react'
import { LOGIN_SEQUENCE } from '@/features/mascot/clips'
import type { MascotStatus } from '@/features/mascot/contracts'
import { useClipSequence } from '@/features/mascot/useClipSequence'
import { hasPlayedIntro, markIntroPlayed } from '../introStorage'
import { OPENING_MS, REVEAL_DELAY_MS } from '../introTimeline'
import { PHASE_BY_INDEX, type IntroPhase } from '../introTypes'

interface Options {
  readonly status: MascotStatus
  readonly reducedMotion: boolean
}

/**
 * Orquesta la intro: apertura → walk → stop → point (revela el login) → idle.
 * Se salta (queda directamente en idle con el login visible) si ya se vio en la
 * sesión, con movimiento reducido, si omiten o si la mascota no puede cargar.
 */
export function useIntroSequence({ status, reducedMotion }: Options) {
  const [alreadyPlayed] = useState(hasPlayedIntro)
  const [skipped, setSkipped] = useState(false)
  const [openingDone, setOpeningDone] = useState(false)
  const [pointReady, setPointReady] = useState(false)
  const sequence = useClipSequence(LOGIN_SEQUENCE)

  const failed = status === 'error' || status === 'unsupported'
  const instant = alreadyPlayed || reducedMotion || failed || skipped
  const started = !instant && openingDone && status === 'ready'
  const finished = started && sequence.isLast
  const settled = instant || finished
  const pointing = started && sequence.index >= 2

  useEffect(() => {
    if (instant) return
    const timer = setTimeout(() => setOpeningDone(true), OPENING_MS)
    return () => clearTimeout(timer)
  }, [instant])

  useEffect(() => {
    if (!pointing || settled) return
    const timer = setTimeout(() => setPointReady(true), REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [pointing, settled])

  useEffect(() => {
    if (skipped || finished) markIntroPlayed()
  }, [skipped, finished])

  const phase: IntroPhase = settled
    ? 'idle'
    : started
      ? (PHASE_BY_INDEX[sequence.index] ?? 'idle')
      : 'opening'
  const playing = started && !settled

  return {
    phase,
    settled,
    revealed: settled || pointReady,
    clip: playing ? sequence.clip : ('idle' as const),
    playId: sequence.playId,
    onClipFinished: playing ? sequence.advance : undefined,
    skip: () => setSkipped(true),
  }
}

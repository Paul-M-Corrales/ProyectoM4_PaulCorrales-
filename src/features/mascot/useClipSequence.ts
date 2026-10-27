import { useCallback, useState } from 'react'
import type { ClipName } from './contracts'

interface Options {
  /** Con movimiento reducido se salta directamente al último clip. */
  readonly reducedMotion?: boolean
}

export function useClipSequence(sequence: readonly ClipName[], options: Options = {}) {
  const [index, setIndex] = useState(0)
  const [playId, setPlayId] = useState(0)
  const last = sequence.length - 1
  const current = options.reducedMotion ? last : Math.min(index, last)

  const advance = useCallback(
    (finished: ClipName) => {
      setIndex((i) => (sequence[i] === finished && i < last ? i + 1 : i))
    },
    [sequence, last],
  )

  const restart = useCallback(() => {
    setIndex(0)
    setPlayId((id) => id + 1)
  }, [])

  return {
    clip: sequence[current] ?? 'idle',
    index: current,
    playId,
    isLast: current === last,
    advance,
    restart,
  }
}

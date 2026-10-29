import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AnimationClip, LoopOnce, type AnimationAction, type AnimationMixer } from 'three'
import { smooth } from './easing'
import { buildWelcomeClip } from './buildWelcomeClip'
import { WELCOME_DURATION } from './welcomePose'

const FADE_IN = 0.35
const FADE_OUT = 0.45
const MAX_SHARE = 0.995

interface Options {
  readonly mixer: AnimationMixer
  readonly animations: readonly AnimationClip[]
  readonly active: boolean
  readonly playId: number
  readonly paused: boolean
  readonly onFinished: () => void
}

/**
 * Reproduce `welcome` como capa sobre idle: solo toca brazos, torso y cabeza.
 * El mezclador normaliza pesos, así que la capa pide un peso e/(1-e) para imponerse con cuota e.
 */
export function useWelcomeOverlay({ mixer, animations, active, playId, paused, onFinished }: Options) {
  const clip = useMemo(() => {
    const idle = AnimationClip.findByName([...animations], 'idle')
    return idle ? buildWelcomeClip(idle) : null
  }, [animations])
  const actionRef = useRef<AnimationAction | null>(null)
  const finishedRef = useRef(onFinished)

  useEffect(() => {
    finishedRef.current = onFinished
  }, [onFinished])

  useEffect(() => {
    if (!active || !clip || paused) return
    const action = mixer.clipAction(clip)
    action.reset().setLoop(LoopOnce, 1)
    action.clampWhenFinished = false
    action.setEffectiveWeight(0.001)
    action.play()
    actionRef.current = action
    const onDone = (event: { action: AnimationAction }) => {
      if (event.action === action) finishedRef.current()
    }
    mixer.addEventListener('finished', onDone)
    return () => {
      mixer.removeEventListener('finished', onDone)
      action.stop()
      actionRef.current = null
    }
  }, [mixer, clip, active, playId, paused])

  useFrame(() => {
    const action = actionRef.current
    if (!action) return
    const share = Math.min(
      smooth(0, FADE_IN, action.time),
      smooth(0, FADE_OUT, WELCOME_DURATION - action.time),
      MAX_SHARE,
    )
    action.setEffectiveWeight(Math.max(share, 0.001) / (1 - Math.max(share, 0.001)))
  })
}

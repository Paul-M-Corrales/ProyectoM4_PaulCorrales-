import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AnimationClip, AnimationMixer, LoopOnce, LoopRepeat, type AnimationAction, type Group } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { disposeObject } from '@/lib/disposeObject'
import { BIKE_NODE_NAME, CLIPS, CROSSFADE_SEC, MASCOT_URL } from './clips'
import type { ClipName } from './contracts'
import { normalizeModel } from './normalizeModel'
import { useWelcomeOverlay } from './welcome/useWelcomeOverlay'

interface Props {
  readonly clip: ClipName
  readonly playId: number
  readonly reducedMotion: boolean
  readonly speed: number
  readonly getYaw: (() => number) | undefined
  readonly onClipFinished: ((clip: ClipName) => void) | undefined
  readonly onReady: () => void
}

function configure(action: AnimationAction, clip: ClipName, paused: boolean) {
  const { repetitions } = CLIPS[clip]
  action.reset()
  if (repetitions === 1) action.setLoop(LoopOnce, 1)
  else action.setLoop(LoopRepeat, repetitions)
  action.clampWhenFinished = true
  action.fadeIn(CROSSFADE_SEC).play()
  action.paused = paused
}

export function MascotModel({ clip, playId, reducedMotion, speed, getYaw, onClipFinished, onReady }: Props) {
  const { scene, animations } = useGLTF(MASCOT_URL)
  const model = useMemo(() => {
    const copy = clone(scene)
    normalizeModel(copy)
    return copy
  }, [scene])
  const mixer = useMemo(() => new AnimationMixer(model), [model])
  const yawRef = useRef<Group>(null)
  const finishedRef = useRef(onClipFinished)
  const mounted = useRef(false)
  const actionRef = useRef<AnimationAction | null>(null)
  const speedRef = useRef(speed)

  useEffect(() => {
    speedRef.current = speed
    if (actionRef.current) actionRef.current.timeScale = speed
  }, [speed])

  useEffect(() => {
    finishedRef.current = onClipFinished
  }, [onClipFinished])

  useEffect(() => {
    mounted.current = true
    onReady()
    return () => {
      mounted.current = false
      // Diferido: StrictMode remonta de inmediato y liberar antes obligaría a recargar el GLB.
      queueMicrotask(() => {
        if (mounted.current) return
        mixer.stopAllAction()
        mixer.uncacheRoot(model)
        disposeObject(scene)
        useGLTF.clear(MASCOT_URL)
      })
    }
  }, [scene, model, mixer, onReady])

  useEffect(() => {
    const bike = model.getObjectByName(BIKE_NODE_NAME)
    if (bike) bike.visible = CLIPS[clip].bike
  }, [model, clip])

  useEffect(() => {
    const base: ClipName = clip === 'welcome' ? 'idle' : clip
    const source = AnimationClip.findByName(animations, base)
    if (!source) return
    const action = mixer.clipAction(source)
    configure(action, base, reducedMotion)
    action.timeScale = speedRef.current
    actionRef.current = action
    const onFinished = (event: { action: AnimationAction }) => {
      if (event.action === action) finishedRef.current?.(base)
    }
    mixer.addEventListener('finished', onFinished)
    return () => {
      mixer.removeEventListener('finished', onFinished)
      action.fadeOut(CROSSFADE_SEC)
      if (actionRef.current === action) actionRef.current = null
    }
  }, [animations, mixer, clip, playId, reducedMotion])

  useWelcomeOverlay({
    mixer,
    animations,
    active: clip === 'welcome',
    playId,
    paused: reducedMotion,
    onFinished: () => finishedRef.current?.('welcome'),
  })

  useFrame((_, delta) => {
    mixer.update(delta)
    // Grupo padre: orienta al conejo sin tocar el GLB ni los ejes de sus clips.
    if (yawRef.current) yawRef.current.rotation.y = getYaw?.() ?? 0
  })

  return (
    <group ref={yawRef}>
      <primitive object={model} />
    </group>
  )
}

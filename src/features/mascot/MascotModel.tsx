import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AnimationClip, AnimationMixer, LoopOnce, LoopRepeat, type AnimationAction } from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { disposeObject } from '@/lib/disposeObject'
import { BIKE_NODE_NAME, CLIPS, CROSSFADE_SEC, MASCOT_URL } from './clips'
import type { ClipName } from './contracts'
import { normalizeModel } from './normalizeModel'

interface Props {
  readonly clip: ClipName
  readonly playId: number
  readonly reducedMotion: boolean
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

export function MascotModel({ clip, playId, reducedMotion, onClipFinished, onReady }: Props) {
  const { scene, animations } = useGLTF(MASCOT_URL)
  const model = useMemo(() => {
    const copy = clone(scene)
    normalizeModel(copy)
    return copy
  }, [scene])
  const mixer = useMemo(() => new AnimationMixer(model), [model])
  const finishedRef = useRef(onClipFinished)
  const mounted = useRef(false)

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
    const source = AnimationClip.findByName(animations, clip)
    if (!source) return
    const action = mixer.clipAction(source)
    configure(action, clip, reducedMotion)
    const onFinished = (event: { action: AnimationAction }) => {
      if (event.action === action) finishedRef.current?.(clip)
    }
    mixer.addEventListener('finished', onFinished)
    return () => {
      mixer.removeEventListener('finished', onFinished)
      action.fadeOut(CROSSFADE_SEC)
    }
  }, [animations, mixer, clip, playId, reducedMotion])

  useFrame((_, delta) => mixer.update(delta))

  return <primitive object={model} />
}

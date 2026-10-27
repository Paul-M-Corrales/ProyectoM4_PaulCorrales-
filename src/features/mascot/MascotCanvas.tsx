import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { usePageVisible } from '@/hooks/usePageVisible'
import { MascotModel } from './MascotModel'
import type { MascotProps } from './contracts'

type Props = Pick<MascotProps, 'clip' | 'playId' | 'reducedMotion' | 'onClipFinished'> & {
  readonly onReady: () => void
}

export default function MascotCanvas({
  clip,
  playId = 0,
  reducedMotion = false,
  onClipFinished,
  onReady,
}: Props) {
  const visible = usePageVisible()

  return (
    <Canvas
      frameloop={visible ? 'always' : 'never'}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5.5], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2} />
      <pointLight position={[-4, 1, -2]} intensity={60} color="#ff1f8e" />
      <pointLight position={[4, -1, -3]} intensity={40} color="#8b5cf6" />
      <Suspense fallback={null}>
        <MascotModel
          clip={clip}
          playId={playId}
          reducedMotion={reducedMotion}
          onClipFinished={onClipFinished}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  )
}

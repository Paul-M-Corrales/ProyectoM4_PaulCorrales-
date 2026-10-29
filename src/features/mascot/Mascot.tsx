import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { isWebGLAvailable } from '@/lib/webgl'
import { MascotErrorBoundary } from './MascotErrorBoundary'
import { MascotFallback } from './MascotFallback'
import type { MascotProps, MascotStatus } from './contracts'
import styles from './Mascot.module.css'

const MascotCanvas = lazy(() => import('./MascotCanvas'))

export function Mascot({
  clip,
  playId = 0,
  label,
  reducedMotion = false,
  speed = 1,
  getYaw,
  onClipFinished,
  onStatusChange,
  className,
}: MascotProps) {
  const supported = useState(isWebGLAvailable)[0]
  const [status, setStatus] = useState<MascotStatus>(supported ? 'loading' : 'unsupported')

  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  const handleReady = useCallback(() => setStatus('ready'), [])
  const handleError = useCallback(() => setStatus('error'), [])

  const failure = (
    <MascotFallback status={supported ? 'error' : 'unsupported'} label={label} />
  )

  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      role="img"
      aria-label={label}
      data-status={status}
      data-clip={clip}
    >
      {!supported ? (
        failure
      ) : (
        <MascotErrorBoundary fallback={failure} onError={handleError}>
          <Suspense fallback={null}>
            <MascotCanvas
              clip={clip}
              playId={playId}
              reducedMotion={reducedMotion}
              speed={speed}
              getYaw={getYaw}
              onClipFinished={onClipFinished}
              onReady={handleReady}
            />
          </Suspense>
          {status === 'loading' && <MascotFallback status="loading" label={label} />}
        </MascotErrorBoundary>
      )}
    </div>
  )
}

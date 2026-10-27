import { useState } from 'react'
import { Link } from 'react-router'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Mascot } from '../Mascot'
import { LOGIN_SEQUENCE } from '../clips'
import type { ClipName, MascotStatus } from '../contracts'
import { useClipSequence } from '../useClipSequence'
import { ClipControls } from './ClipControls'
import styles from './MascotDevPage.module.css'

type Mode = 'sequence' | 'manual'

export function MascotDevPage() {
  const reduced = usePrefersReducedMotion()
  const [mode, setMode] = useState<Mode>('sequence')
  const [manualClip, setManualClip] = useState<ClipName>('idle')
  const [manualId, setManualId] = useState(0)
  const [status, setStatus] = useState<MascotStatus>('loading')
  const sequence = useClipSequence(LOGIN_SEQUENCE, { reducedMotion: reduced })

  const isSequence = mode === 'sequence'
  const clip = isSequence ? sequence.clip : manualClip

  const playSequence = () => {
    setMode('sequence')
    sequence.restart()
  }
  const playClip = (next: ClipName) => {
    setMode('manual')
    setManualClip(next)
    setManualId((id) => id + 1)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/">← On-going</Link>
        <h1>Laboratorio de la mascota</h1>
        <p>Ruta de desarrollo (ONGOING-M4-001). No es el login final.</p>
      </header>
      <section className={styles.stage}>
        <Mascot
          clip={clip}
          playId={isSequence ? sequence.playId : manualId}
          label="Conejo 3D mascota de On-going"
          reducedMotion={reduced}
          onClipFinished={isSequence ? sequence.advance : undefined}
          onStatusChange={setStatus}
        />
      </section>
      <ClipControls
        activeClip={clip}
        status={status}
        stepLabel={isSequence ? `${sequence.index + 1}/${LOGIN_SEQUENCE.length}` : 'manual'}
        onPlayClip={playClip}
        onPlaySequence={playSequence}
      />
    </main>
  )
}

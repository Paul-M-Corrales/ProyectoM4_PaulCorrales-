import { CLIPS, LOGIN_SEQUENCE } from '../clips'
import { CLIP_NAMES, type ClipName, type MascotStatus } from '../contracts'
import styles from './MascotDevPage.module.css'

interface Props {
  readonly activeClip: ClipName
  readonly status: MascotStatus
  readonly stepLabel: string
  readonly onPlayClip: (clip: ClipName) => void
  readonly onPlaySequence: () => void
}

export function ClipControls({ activeClip, status, stepLabel, onPlayClip, onPlaySequence }: Props) {
  return (
    <aside className={styles.panel} aria-label="Controles de animación">
      <button type="button" className={styles.primary} onClick={onPlaySequence}>
        Reproducir secuencia de login ({LOGIN_SEQUENCE.join(' → ')})
      </button>
      <ul className={styles.clips}>
        {CLIP_NAMES.map((name) => (
          <li key={name}>
            <button
              type="button"
              className={styles.clip}
              aria-pressed={name === activeClip}
              onClick={() => onPlayClip(name)}
            >
              {name}
              <small>{CLIPS[name].durationSec}s</small>
            </button>
          </li>
        ))}
      </ul>
      <dl className={styles.readout}>
        <dt>Estado</dt>
        <dd data-testid="mascot-status">{status}</dd>
        <dt>Clip actual</dt>
        <dd data-testid="mascot-clip">{activeClip}</dd>
        <dt>Paso</dt>
        <dd>{stepLabel}</dd>
      </dl>
    </aside>
  )
}

import { useState } from 'react'
import { LoginPanel } from '@/features/auth/components/LoginPanel'
import { pendingAuthGateway } from '@/features/auth/services/pendingAuthGateway'
import type { AuthGateway } from '@/features/auth/types'
import { FuchsiaBackdrop } from '@/features/intro/components/FuchsiaBackdrop'
import { MascotStage } from '@/features/intro/components/MascotStage'
import { SkipIntroButton } from '@/features/intro/components/SkipIntroButton'
import { useIntroSequence } from '@/features/intro/hooks/useIntroSequence'
import type { MascotStatus } from '@/features/mascot'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import styles from './login-page.module.css'

export function LoginPage({ gateway = pendingAuthGateway }: { readonly gateway?: AuthGateway }) {
  const reducedMotion = usePrefersReducedMotion()
  const [status, setStatus] = useState<MascotStatus>('loading')
  const intro = useIntroSequence({ status, reducedMotion })

  return (
    <main className={styles.page}>
      <FuchsiaBackdrop />
      {!intro.settled && <SkipIntroButton onSkip={intro.skip} />}
      <div className={styles.mascot}>
        <MascotStage
          phase={intro.phase}
          settled={intro.settled}
          clip={intro.clip}
          playId={intro.playId}
          reducedMotion={reducedMotion}
          onClipFinished={intro.onClipFinished}
          onStatusChange={setStatus}
        />
      </div>
      <div className={styles.panel}>
        <LoginPanel revealed={intro.revealed} gateway={gateway} />
      </div>
    </main>
  )
}

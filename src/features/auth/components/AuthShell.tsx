import type { ReactNode } from 'react'
import { FuchsiaBackdrop } from '@/features/intro/components/FuchsiaBackdrop'
import { MascotStage } from '@/features/intro/components/MascotStage'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { BrandMark } from './BrandMark'
import panelStyles from './login-panel.module.css'
import pageStyles from '../pages/login-page.module.css'

interface Props {
  readonly titleId: string
  readonly title: string
  readonly subtitle: string
  readonly children: ReactNode
}

const ignoreStatus = () => {}

/** Marco visual de las pantallas de acceso secundarias: mismo fondo, cristal y conejo (sin intro). */
export function AuthShell({ titleId, title, subtitle, children }: Props) {
  const reducedMotion = usePrefersReducedMotion()
  return (
    <main className={pageStyles.page}>
      <FuchsiaBackdrop />
      <div className={pageStyles.mascot}>
        <MascotStage
          phase="idle"
          settled
          clip="idle"
          playId={0}
          reducedMotion={reducedMotion}
          onClipFinished={undefined}
          onStatusChange={ignoreStatus}
        />
      </div>
      <div className={pageStyles.panel}>
        <div className={panelStyles.wrap}>
          <section className={panelStyles.panel} aria-labelledby={titleId}>
            <BrandMark />
            <h1 id={titleId} className={panelStyles.title}>
              {title}
            </h1>
            <p className={panelStyles.subtitle}>{subtitle}</p>
            {children}
          </section>
        </div>
      </div>
    </main>
  )
}

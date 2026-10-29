import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import styles from './section-page.module.css'

interface Props {
  readonly title: string
  readonly lead: string
  readonly children: ReactNode
}

/** Estructura común de Reportes y Configuración: título editorial y tarjetas limpias. */
export function SectionPage({ title, lead, children }: Props) {
  return (
    <section className={styles.page} aria-labelledby="section-title">
      <header className={styles.header}>
        <Eyebrow>Tu día, en movimiento</Eyebrow>
        <h1 id="section-title" className={styles.title}>{title}</h1>
        <p className={styles.lead}>{lead}</p>
      </header>
      {children}
    </section>
  )
}

import type { ReactNode } from 'react'
import styles from './section-page.module.css'

interface Props {
  readonly title: string
  readonly status: string
  readonly children?: ReactNode
}

/** Pantalla con estado inicial honesto: explica qué falta sin inventar datos. */
export function SectionPage({ title, status, children }: Props) {
  return (
    <section className={styles.page} aria-labelledby="section-title">
      <h1 id="section-title" className={styles.title}>{title}</h1>
      <div className={styles.panel}>
        <p className={styles.status}>{status}</p>
        {children}
      </div>
    </section>
  )
}

import type { ReactNode } from 'react'
import { ChecklistMock, FocusMock, ProgressMock } from './MiniMocks'
import styles from './how-it-works.module.css'

interface Step {
  readonly number: string
  readonly tone: 'green' | 'lavender' | 'orange'
  readonly title: [string, string]
  readonly text: string
  readonly mock: ReactNode
}

const STEPS: readonly Step[] = [
  {
    number: '01',
    tone: 'green',
    title: ['Organizá', 'tus tareas'],
    text: 'Crea, prioriza y gestiona todo en un solo lugar. Mantén tu día bajo control de forma simple.',
    mock: <ChecklistMock />,
  },
  {
    number: '02',
    tone: 'lavender',
    title: ['Visualizá', 'tu progreso'],
    text: 'Sigue tu avance con reportes claros y motivadores. Pequeños pasos, grandes resultados.',
    mock: <ProgressMock />,
  },
  {
    number: '03',
    tone: 'orange',
    title: ['Mantené', 'el enfoque'],
    text: 'Usa herramientas que te ayudan a concentrarte, evitar distracciones y hacer más, sin complicaciones.',
    mock: <FocusMock />,
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className={styles.section} aria-labelledby="how-title">
      <h2 id="how-title" className={styles.heading}>Así funciona On-going</h2>
      <ol className={styles.grid}>
        {STEPS.map((step) => (
          <li key={step.number} className={`${styles.card} ${styles[step.tone]}`}>
            <div className={styles.copy}>
              <span className={styles.number}>{step.number}</span>
              <h3 className={styles.title}>
                {step.title[0]}
                <br />
                {step.title[1]}
              </h3>
              <p>{step.text}</p>
            </div>
            <div className={styles.mock} aria-hidden="true">{step.mock}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}

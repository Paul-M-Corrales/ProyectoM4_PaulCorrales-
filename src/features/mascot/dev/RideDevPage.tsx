import { useState } from 'react'
import { Link } from 'react-router'
import { RideMascot } from '../ride/RideMascot'
import { progressRatio, rideStateFor } from '../ride/rideProgress'
import styles from './MascotDevPage.module.css'

const TOTAL = 10

/** Solo desarrollo: verifica ride-idle, ride (velocidades) y ride-celebrate. Los números son de prueba, no datos reales. */
export function RideDevPage() {
  const [completed, setCompleted] = useState(0)
  const progress = { total: TOTAL, completed }
  const state = rideStateFor(progress)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/tareas">← Mis tareas</Link>
        <h1>Prueba del conejo en bicicleta</h1>
        <p>Modo de prueba solo para desarrollo. Los valores son simulados y no se guardan.</p>
      </header>
      <section className={styles.stage}>
        <RideMascot progress={progress} />
      </section>
      <label>
        Tareas completadas (simulado): {completed} de {TOTAL}
        <input
          type="range"
          min={0}
          max={TOTAL}
          value={completed}
          onChange={(event) => setCompleted(Number(event.target.value))}
        />
      </label>
      <p data-testid="ride-state">
        {Math.round(progressRatio(progress) * 100)} % → clip <strong>{state.clip}</strong>, velocidad ×
        {state.speed.toFixed(2)}
      </p>
    </main>
  )
}

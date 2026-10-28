import { useState } from 'react'
import { BrandMark } from '@/features/auth/components/BrandMark'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { FuchsiaBackdrop } from '@/features/intro/components/FuchsiaBackdrop'
import buttons from '@/features/auth/components/buttons.module.css'
import fields from '@/features/auth/components/fields.module.css'
import styles from './dashboard-page.module.css'

/** Pantalla privada provisional: bienvenida, identificación del usuario y cierre de sesión. */
export function DashboardPage() {
  const { session, gateway } = useAuth()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const user = session.status === 'authenticated' ? session.user : null
  const name = user?.displayName ?? user?.email ?? 'tu cuenta'

  const logout = async () => {
    if (pending) return
    setPending(true)
    setError(undefined)
    const result = await gateway.signOut()
    // Al cerrar sesión el observer redirige al login; solo hay que reaccionar a un fallo.
    if (!result.ok) {
      setError(result.message)
      setPending(false)
    }
  }

  return (
    <main className={styles.page}>
      <FuchsiaBackdrop />
      <section className={styles.panel} aria-labelledby="dashboard-title">
        <BrandMark />
        <h1 id="dashboard-title" className={styles.title}>
          ¡Bienvenido/a!
        </h1>
        <p className={styles.user}>
          Sesión iniciada como <strong>{name}</strong>
        </p>
        <p className={styles.hint}>Tu gestor de tareas llega muy pronto.</p>
        {error && (
          <p className={`${fields.feedback} ${fields.feedbackError}`} role="alert">
            {error}
          </p>
        )}
        <button type="button" className={buttons.google} disabled={pending} onClick={() => void logout()}>
          {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
      </section>
    </main>
  )
}

import { useAccount } from '@/app/layout/useAccount'
import { Button } from '@/components/ui/Button'
import { useLogout } from '@/app/layout/useLogout'
import { SectionPage } from './SectionPage'
import styles from './cards.module.css'

export function SettingsPage() {
  const account = useAccount()
  const { logout, pending, error } = useLogout()

  return (
    <SectionPage
      title="Configuración"
      lead="Las preferencias de la aplicación todavía no están disponibles. Por ahora puedes consultar tu cuenta."
    >
      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="account-title">
          <h2 id="account-title">Cuenta</h2>
          <dl>
            <dt>Nombre</dt>
            <dd>{account.name}</dd>
            {account.email && (
              <>
                <dt>Correo</dt>
                <dd>{account.email}</dd>
              </>
            )}
          </dl>
          <Button variant="outline" disabled={pending} onClick={() => void logout()}>
            {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
          {error && <p role="alert">{error}</p>}
        </section>
        <section className={styles.panel} aria-labelledby="prefs-title">
          <h2 id="prefs-title">Preferencias</h2>
          <p>Aquí podrás elegir recordatorios, tema y formato de fechas cuando estén disponibles.</p>
        </section>
      </div>
    </SectionPage>
  )
}

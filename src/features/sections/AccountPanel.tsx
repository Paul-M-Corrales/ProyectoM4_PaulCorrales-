import { useContext } from 'react'
import { useAccount } from '@/app/layout/useAccount'
import { useLogout } from '@/app/layout/useLogout'
import { Button } from '@/components/ui/Button'
import { AccountInfoContext } from './accountInfoContext'
import type { AuthProviderKind } from './accountInfoService'
import styles from './cards.module.css'

const PROVIDERS: Record<AuthProviderKind, string> = {
  google: 'Google',
  password: 'Correo y contraseña',
  other: 'Otro proveedor',
}

/** Datos reales de la cuenta (nada de ejemplo) y cierre de sesión. */
export function AccountPanel() {
  const account = useAccount()
  const read = useContext(AccountInfoContext)
  const info = read()
  const { logout, pending, error } = useLogout()

  return (
    <section className={styles.panel} aria-labelledby="account-title">
      <h2 id="account-title">Cuenta</h2>
      <dl>
        <dt>Nombre visible</dt>
        <dd>{account.name === account.email ? 'Sin nombre definido' : account.name}</dd>
        {account.email && (
          <>
            <dt>Correo</dt>
            <dd>{account.email}</dd>
          </>
        )}
        {info.provider && (
          <>
            <dt>Método de acceso</dt>
            <dd>{PROVIDERS[info.provider]}</dd>
          </>
        )}
        {info.emailVerified !== null && (
          <>
            <dt>Verificación del correo</dt>
            <dd>{info.emailVerified ? 'Verificado' : 'Sin verificar'}</dd>
          </>
        )}
      </dl>
      <Button variant="outline" disabled={pending} onClick={() => void logout()}>
        {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  )
}

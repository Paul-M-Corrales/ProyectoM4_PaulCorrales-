import { useCallback, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { useAccount } from './useAccount'
import { useDismiss } from './useDismiss'
import { useLogout } from './useLogout'
import styles from './account-menu.module.css'

export function AccountMenu() {
  const account = useAccount()
  const { logout, pending, error } = useLogout()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Cuenta de ${account.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.avatar}>{account.initials}</span>
        <Icon name="chevron" size={18} />
      </button>
      {open && (
        <div className={styles.menu}>
          <p className={styles.who}>
            <strong>{account.name}</strong>
            {account.email && account.email !== account.name && <span>{account.email}</span>}
          </p>
          <button type="button" className={styles.logout} disabled={pending} onClick={() => void logout()}>
            {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
      )}
    </div>
  )
}

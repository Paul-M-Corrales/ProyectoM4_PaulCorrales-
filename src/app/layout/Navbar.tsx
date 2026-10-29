import { Link, NavLink } from 'react-router'
import { BrandMark } from '@/features/auth/components/BrandMark'
import { NAV_ITEMS } from './navItems'
import { useLogout } from './useLogout'
import styles from './navbar.module.css'

export function Navbar() {
  const { logout, pending, error } = useLogout()

  return (
    <header className={styles.bar}>
      <Link to="/inicio" className={styles.brand} aria-label="On-going, ir al inicio">
        <BrandMark />
      </Link>
      <nav className={styles.nav} aria-label="Principal">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={styles.link ?? ''}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.session}>
        <button type="button" className={styles.logout} disabled={pending} onClick={() => void logout()}>
          {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </button>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </header>
  )
}

import { Link, NavLink } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { AccountMenu } from './AccountMenu'
import { AppLogo } from './AppLogo'
import { NAV_ITEMS } from './navItems'
import styles from './navbar.module.css'

export function Navbar() {
  return (
    <header className={styles.bar}>
      <Link to="/inicio" className={styles.brand} aria-label="On-going, ir al inicio">
        <AppLogo />
      </Link>
      <nav className={styles.nav} aria-label="Principal">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={styles.link ?? ''}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className={styles.actions}>
        <span className={styles.cta}>
          <ButtonLink to="/tareas?nueva=1" icon="plus">Nueva tarea</ButtonLink>
        </span>
        <AccountMenu />
      </div>
    </header>
  )
}

import styles from './app-logo.module.css'

/** Logo de la app: conejo negro sobre cuadrado amarillo, junto al nombre. */
export function AppLogo() {
  return (
    <span className={styles.logo}>
      <svg className={styles.mark} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <rect width="48" height="48" rx="13" fill="#ffd23f" />
        <path d="M17 6c4 0 5 7 4.5 14H15c-2-7-1-14 2-14Zm14 0c3 0 4 7 2 14h-6.5C26 13 27 6 31 6Z" fill="#0c0c10" />
        <ellipse cx="24" cy="30" rx="12" ry="10.5" fill="#0c0c10" />
        <rect x="14" y="26" width="9" height="5" rx="2.5" fill="#fff" />
        <rect x="25" y="26" width="9" height="5" rx="2.5" fill="#fff" />
        <path d="M21 36h6l-3 3-3-3Z" fill="#ff5fa8" />
      </svg>
      <span className={styles.word}>On-going</span>
    </span>
  )
}

import styles from './BrandMark.module.css'

export function BrandMark() {
  return (
    <div className={styles.brand}>
      <svg className={styles.logo} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="ongoing-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff1f8e" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="14" fill="url(#ongoing-logo)" />
        <circle cx="24" cy="24" r="10" fill="none" stroke="#fff" strokeWidth="4" />
        <circle cx="34" cy="14" r="3.5" fill="#fff" />
      </svg>
      <span className={styles.word}>On-going</span>
    </div>
  )
}

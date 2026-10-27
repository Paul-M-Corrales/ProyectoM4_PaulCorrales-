import styles from './skip-intro.module.css'

export function SkipIntroButton({ onSkip }: { readonly onSkip: () => void }) {
  return (
    <button type="button" className={styles.skip} onClick={onSkip}>
      Omitir introducción
    </button>
  )
}

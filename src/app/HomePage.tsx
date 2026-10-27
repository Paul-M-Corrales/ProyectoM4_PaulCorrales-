import { motion } from 'motion/react'
import { Link } from 'react-router'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import styles from './HomePage.module.css'

export function HomePage() {
  const reduced = usePrefersReducedMotion()
  return (
    <main className={styles.page}>
      <motion.h1
        className={styles.wordmark}
        initial={reduced ? false : { opacity: 0, y: 40, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        On-going
      </motion.h1>
      <p className={styles.tagline}>Fundación del proyecto · ONGOING-M4-001</p>
      <Link className={styles.cta} to="/dev/mascot">
        Ver laboratorio de la mascota
      </Link>
    </main>
  )
}

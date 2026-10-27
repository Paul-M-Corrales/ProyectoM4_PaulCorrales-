import { motion } from 'motion/react'
import styles from './login-panel.module.css'

/** Estallido de luz y onda expansiva que acompaña la revelación del panel. */
export function RevealBurst({ active }: { readonly active: boolean }) {
  return (
    <>
      <motion.div
        className={styles.bloom}
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={active ? { opacity: [0, 1, 0.45], scale: [0.2, 1.5, 1.15] } : { opacity: 0 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
      <motion.div
        className={styles.ring}
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={active ? { opacity: [0.9, 0], scale: [0.3, 2.4] } : { opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
    </>
  )
}

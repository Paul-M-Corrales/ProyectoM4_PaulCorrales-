import { motion, type Variants } from 'motion/react'
import { useState } from 'react'
import type { AuthGateway } from '../types'
import { BrandMark } from './BrandMark'
import { LoginForm } from './LoginForm'
import { RevealBurst } from './RevealBurst'
import styles from './login-panel.module.css'

const PANEL: Variants = {
  hidden: { opacity: 0, scale: 0.55, rotateX: -28, y: 70, filter: 'blur(18px)' },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 85, damping: 15, mass: 0.9 },
  },
}

interface Props {
  readonly revealed: boolean
  readonly gateway: AuthGateway
}

export function LoginPanel({ revealed, gateway }: Props) {
  const [initiallyRevealed] = useState(revealed)
  return (
    <div className={styles.wrap}>
      {!initiallyRevealed && <RevealBurst active={revealed} />}
      <motion.section
        className={styles.panel}
        aria-labelledby="login-title"
        variants={PANEL}
        initial={initiallyRevealed ? 'visible' : 'hidden'}
        animate={revealed ? 'visible' : 'hidden'}
        inert={!revealed}
      >
        <BrandMark />
        <h1 id="login-title" className={styles.title}>
          Entrá a tu rutina
        </h1>
        <p className={styles.subtitle}>Iniciá sesión para continuar con tus tareas.</p>
        <LoginForm gateway={gateway} />
      </motion.section>
    </div>
  )
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { Icon, type IconName } from './Icon'
import styles from './button.module.css'

type Variant = 'solid' | 'outline' | 'ghost'

interface Shared {
  readonly variant?: Variant
  readonly icon?: IconName | undefined
  readonly iconAfter?: IconName | undefined
  readonly children: ReactNode
}

const classes = (variant: Variant = 'solid') => `${styles.button} ${styles[variant]}`

function Content({ icon, iconAfter, children }: Pick<Shared, 'icon' | 'iconAfter' | 'children'>) {
  return (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} />}
    </>
  )
}

export function Button({
  variant,
  icon,
  iconAfter,
  children,
  type = 'button',
  ...rest
}: Shared & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} {...rest} className={classes(variant)}>
      <Content icon={icon} iconAfter={iconAfter}>{children}</Content>
    </button>
  )
}

export function ButtonLink({ variant, icon, iconAfter, children, ...rest }: Shared & LinkProps) {
  return (
    <Link {...rest} className={classes(variant)}>
      <Content icon={icon} iconAfter={iconAfter}>{children}</Content>
    </Link>
  )
}

/** Ancla con aspecto de botón, para saltos dentro de la misma página. */
export function ButtonAnchor({
  variant,
  icon,
  iconAfter,
  children,
  ...rest
}: Shared & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...rest} className={classes(variant)}>
      <Content icon={icon} iconAfter={iconAfter}>{children}</Content>
    </a>
  )
}

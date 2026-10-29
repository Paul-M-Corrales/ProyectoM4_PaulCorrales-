export interface NavItem {
  readonly to: string
  readonly label: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/inicio', label: 'Inicio' },
  { to: '/tareas', label: 'Mis tareas' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/configuracion', label: 'Configuración' },
]

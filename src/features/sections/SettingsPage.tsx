import { useAuth } from '@/features/auth/hooks/useAuth'
import { SectionPage } from './SectionPage'

export function SettingsPage() {
  const { session } = useAuth()
  const user = session.status === 'authenticated' ? session.user : null

  return (
    <SectionPage
      title="Configuración"
      status="Las preferencias de la aplicación todavía no están disponibles. Estos son los datos de tu sesión:"
    >
      <dl>
        <dt>Cuenta</dt>
        <dd>{user?.displayName ?? user?.email ?? 'Sin identificar'}</dd>
        {user?.displayName && user.email && (
          <>
            <dt>Correo</dt>
            <dd>{user.email}</dd>
          </>
        )}
      </dl>
    </SectionPage>
  )
}

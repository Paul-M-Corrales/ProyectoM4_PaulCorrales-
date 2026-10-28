import { AuthShell } from '../components/AuthShell'
import { ResetForm } from '../components/ResetForm'
import { useAuth } from '../hooks/useAuth'

export function ResetPasswordPage() {
  const { gateway } = useAuth()
  return (
    <AuthShell
      titleId="reset-title"
      title="Recuperá tu contraseña"
      subtitle="Ingresá tu correo y te enviamos las instrucciones."
    >
      <ResetForm gateway={gateway} />
    </AuthShell>
  )
}

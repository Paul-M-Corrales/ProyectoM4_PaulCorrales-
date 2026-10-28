import { AuthShell } from '../components/AuthShell'
import { RegisterForm } from '../components/RegisterForm'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { gateway } = useAuth()
  return (
    <AuthShell
      titleId="register-title"
      title="Creá tu cuenta"
      subtitle="Sumate a On-going y empezá a ordenar tus tareas."
    >
      <RegisterForm gateway={gateway} />
    </AuthShell>
  )
}

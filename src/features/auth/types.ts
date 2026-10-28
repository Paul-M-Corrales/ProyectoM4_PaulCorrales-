export type AuthAction = 'sign-in' | 'google' | 'sign-up' | 'reset'

export type AuthFailureCode =
  | 'not-configured'
  | 'invalid-credentials'
  | 'cancelled'
  | 'network'
  | 'rate-limited'
  | 'invalid-input'
  | 'unknown'

export type AuthFailure = {
  readonly ok: false
  readonly code: AuthFailureCode
  readonly message: string
}

export type AuthResult = { readonly ok: true; readonly message?: string } | AuthFailure

export interface AuthUser {
  readonly uid: string
  readonly email: string | null
  readonly displayName: string | null
}

export type Unsubscribe = () => void

/** Frontera entre la UI y el proveedor de identidad: ningún componente importa Firebase. */
export interface AuthGateway {
  signInWithEmail(email: string, password: string): Promise<AuthResult>
  signInWithGoogle(): Promise<AuthResult>
  signUpWithEmail(email: string, password: string): Promise<AuthResult>
  requestPasswordReset(email: string): Promise<AuthResult>
  signOut(): Promise<AuthResult>
  /** Observa la sesión; el primer valor llega cuando el proveedor termina de restaurarla. */
  onAuthChange(next: (user: AuthUser | null) => void, onError?: () => void): Unsubscribe
}

export type SessionState =
  | { readonly status: 'loading' }
  | { readonly status: 'authenticated'; readonly user: AuthUser }
  | { readonly status: 'unauthenticated' }

export interface LoginValues {
  readonly email: string
  readonly password: string
}

export interface RegisterValues extends LoginValues {
  readonly confirmPassword: string
}

export type FieldErrors = Partial<Record<keyof RegisterValues, string>>

export type FormStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading'; readonly action: AuthAction }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'notice'; readonly message: string }
  | { readonly kind: 'success'; readonly message: string }

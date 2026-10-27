export type AuthAction = 'sign-in' | 'google' | 'sign-up' | 'reset'

export type AuthResult =
  | { readonly ok: true }
  | {
      readonly ok: false
      readonly code: 'integration-pending' | 'invalid-credentials' | 'network' | 'unknown'
      readonly message: string
    }

/** Contrato que implementará Firebase Auth en ONGOING-M4-003. */
export interface AuthGateway {
  signInWithEmail(email: string, password: string): Promise<AuthResult>
  signInWithGoogle(): Promise<AuthResult>
  signUpWithEmail(email: string, password: string): Promise<AuthResult>
  requestPasswordReset(email: string): Promise<AuthResult>
}

export interface LoginValues {
  readonly email: string
  readonly password: string
}

export type FieldErrors = Partial<Record<keyof LoginValues, string>>

export type FormStatus =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading'; readonly action: AuthAction }
  | { readonly kind: 'error'; readonly message: string }
  | { readonly kind: 'notice'; readonly message: string }

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth'
import type { AuthAction, AuthGateway, AuthResult, AuthUser } from '../types'
import { errorCode, RESET_NOTICE, toAuthFailure } from '../utils/firebaseErrors'

async function attempt(
  action: AuthAction | 'sign-out',
  operation: () => Promise<unknown>,
): Promise<AuthResult> {
  try {
    await operation()
    return { ok: true }
  } catch (error) {
    return toAuthFailure(error, action)
  }
}

/** Implementación del contrato AuthGateway sobre Firebase Auth (SDK modular). */
export function createFirebaseAuthGateway(auth: Auth): AuthGateway {
  return {
    signInWithEmail: (email, password) =>
      attempt('sign-in', () => signInWithEmailAndPassword(auth, email, password)),

    signInWithGoogle: () => {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      return attempt('google', () => signInWithPopup(auth, provider))
    },

    signUpWithEmail: (email, password) =>
      attempt('sign-up', () => createUserWithEmailAndPassword(auth, email, password)),

    async requestPasswordReset(email) {
      try {
        await sendPasswordResetEmail(auth, email)
      } catch (error) {
        // Mismo resultado exista o no la cuenta: evita la enumeración de usuarios.
        if (errorCode(error) !== 'auth/user-not-found') return toAuthFailure(error, 'reset')
      }
      return { ok: true, message: RESET_NOTICE }
    },

    signOut: () => attempt('sign-out', () => signOut(auth)),

    onAuthChange(next, onError) {
      return onAuthStateChanged(
        auth,
        (user) => {
          const mapped: AuthUser | null = user
            ? { uid: user.uid, email: user.email, displayName: user.displayName }
            : null
          next(mapped)
        },
        () => onError?.(),
      )
    },
  }
}

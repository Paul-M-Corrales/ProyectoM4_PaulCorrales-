import { createContext } from 'react'
import { unconfiguredAuthGateway } from '../services/unconfiguredAuthGateway'
import type { AuthGateway, SessionState } from '../types'

export interface AuthContextValue {
  readonly session: SessionState
  readonly gateway: AuthGateway
}

export const AuthContext = createContext<AuthContextValue>({
  session: { status: 'unauthenticated' },
  gateway: unconfiguredAuthGateway,
})

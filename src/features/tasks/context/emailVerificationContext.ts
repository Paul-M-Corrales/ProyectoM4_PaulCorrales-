import { createContext } from 'react'
import {
  createEmailVerificationService,
  type EmailVerificationService,
} from '../services/emailVerificationService'

/** Los tests inyectan aquí un servicio de mentira; la app usa Firebase Authentication. */
export const EmailVerificationContext = createContext<EmailVerificationService>(createEmailVerificationService())

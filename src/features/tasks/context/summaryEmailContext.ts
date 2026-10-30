import { createContext } from 'react'
import { createSummaryEmailService, type SummaryEmailService } from '../services/summaryEmailService'

/** Los tests inyectan aquí un servicio de mentira; la app usa el endpoint serverless. */
export const SummaryEmailContext = createContext<SummaryEmailService>(createSummaryEmailService())

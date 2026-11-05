import { createContext } from 'react'
import { createAccountInfoReader, type AccountInfoReader } from './accountInfoService'

/** Los tests inyectan aquí un lector de mentira; la app usa Firebase Authentication. */
export const AccountInfoContext = createContext<AccountInfoReader>(createAccountInfoReader())

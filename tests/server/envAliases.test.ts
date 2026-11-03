import { describe, expect, it } from 'vitest'
import { readServerConfig } from '../../server/env'

const firebase = { FIREBASE_PROJECT_ID: 'p', FIREBASE_CLIENT_EMAIL: 'x@p.iam', FIREBASE_PRIVATE_KEY: 'k' }

describe('nombres de variables de AWS SES', () => {
  it('acepta AWS_SES_FROM_EMAIL, el nombre configurado en Vercel', () => {
    const result = readServerConfig({ ...firebase, AWS_REGION: 'us-east-2', AWS_SES_FROM_EMAIL: 'a@b.com' })
    expect(result.ok && result.config.fromEmail).toBe('a@b.com')
  })

  it('SES_REGION y SES_FROM_EMAIL tienen prioridad sobre los nombres AWS_*', () => {
    const result = readServerConfig({
      ...firebase, AWS_REGION: 'sa-east-1', SES_REGION: 'us-east-2',
      AWS_SES_FROM_EMAIL: 'viejo@b.com', SES_FROM_EMAIL: 'nuevo@b.com',
    })
    expect(result.ok && result.config.awsRegion).toBe('us-east-2')
    expect(result.ok && result.config.fromEmail).toBe('nuevo@b.com')
  })

  it('sin remitente ni región informa los nombres, nunca valores', () => {
    const result = readServerConfig({ ...firebase })
    expect(result).toEqual({ ok: false, missing: ['AWS_REGION', 'AWS_SES_FROM_EMAIL'] })
  })
})

import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import type { ServerConfig } from './env.js'
import type { EmailSender } from './types.js'

/** Adaptador sobre AWS SES v2. Las credenciales viven solo en el servidor. */
export function createSesSender(config: ServerConfig, client?: Pick<SESv2Client, 'send'>): EmailSender {
  const ses =
    client ??
    new SESv2Client({
      region: config.awsRegion,
      ...(config.awsCredentials && { credentials: config.awsCredentials }),
    })
  return {
    async send({ to, subject, html, text }) {
      await ses.send(
        new SendEmailCommand({
          FromEmailAddress: config.fromEmail,
          Destination: { ToAddresses: [to] },
          Content: {
            Simple: {
              Subject: { Data: subject, Charset: 'UTF-8' },
              Body: { Html: { Data: html, Charset: 'UTF-8' }, Text: { Data: text, Charset: 'UTF-8' } },
            },
          },
        }),
      )
    },
  }
}

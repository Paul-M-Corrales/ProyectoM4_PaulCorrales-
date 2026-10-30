import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv, type Plugin } from 'vite'

const ROUTE = '/api/tasks/summary-email'

function toRequest(req: IncomingMessage): Request {
  const headers = new Headers()
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value)
  }
  return new Request(`http://${req.headers.host ?? 'localhost'}${req.url ?? ROUTE}`, { method: req.method ?? 'POST', headers })
}

async function writeResponse(response: Response, res: ServerResponse) {
  res.statusCode = response.status
  response.headers.forEach((value, name) => res.setHeader(name, value))
  res.end(await response.text())
}

/**
 * Solo desarrollo: sirve la misma función de api/ dentro de `npm run dev`, sin cuenta de Vercel.
 * Las variables del servidor (sin prefijo VITE_) se leen de .env.local y NUNCA llegan al bundle del navegador.
 */
export function devApi(): Plugin {
  return {
    name: 'ongoing-dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      for (const [key, value] of Object.entries(env)) process.env[key] ??= value
      server.middlewares.use(ROUTE, (req, res, next) => {
        server
          .ssrLoadModule('/api/tasks/summary-email.ts')
          .then((module) => (module.POST as (request: Request) => Promise<Response>)(toRequest(req)))
          .then((response) => writeResponse(response, res))
          .catch(next)
      })
    },
  }
}

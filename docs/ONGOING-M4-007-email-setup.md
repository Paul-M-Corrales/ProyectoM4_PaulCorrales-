# Resumen de tareas por correo (AWS SES + Vercel Functions)

Endpoint: `POST /api/tasks/summary-email` (archivo `api/tasks/summary-email.ts`, lógica en `server/`).

## Flujo

1. El navegador envía `Authorization: Bearer <Firebase ID Token>` y `X-Requested-With: ongoing-web`, sin cuerpo.
2. El servidor verifica el token con Firebase Admin; de ahí salen el UID y el destinatario (correo **verificado** de la cuenta).
3. Reserva el envío en `emailRateLimits/{uid}` (transacción de Firestore: 60 s entre envíos, 5 por día UTC).
4. Lee solo `users/{uid}/tasks` (máx. 500), arma el resumen y lo envía por SES.
5. Responde 202 `accepted`. SES acepta el mensaje; no garantiza la entrega a la bandeja de entrada.

## Variables (solo servidor, nunca `VITE_`)

`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SES_FROM_EMAIL` (alias con prioridad: `SES_FROM_EMAIL`),
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, opcional `APP_ALLOWED_ORIGINS`.
`SES_REGION` (opcional) tiene prioridad sobre `AWS_REGION`: Vercel puede fijar `AWS_REGION` en runtime.
Si faltan las dos claves de AWS se usa la cadena estándar de credenciales del SDK.

## Pasos manuales en AWS

1. SES → Verified identities: verificar `AWS_SES_FROM_EMAIL` (o su dominio) en la región elegida.
2. Cuenta en *sandbox*: verificar también cada correo destinatario de prueba, o solicitar acceso a producción.
3. IAM: crear un usuario dedicado (sin permisos de administrador) con una política mínima:
   `ses:SendEmail` sobre el ARN de esa identidad (`arn:aws:ses:<región>:<cuenta>:identity/<identidad>`).
4. Generar su clave de acceso y guardarla solo en Vercel / `.env.local`.

## Pasos manuales en Firebase / Vercel

1. Firebase → Configuración del proyecto → Cuentas de servicio → generar clave. Copiar `project_id`, `client_email` y
   `private_key` a las variables; **no** subir el JSON al repositorio.
2. Vercel → Project → Settings → Environment Variables: cargar las variables anteriores (Production y Preview).
3. Firebase Auth → Authorized domains: incluir el dominio de Vercel.
4. Las reglas de Firestore **no cambian**: `emailRateLimits` queda denegada a clientes por defecto y el Admin SDK las omite.

## Desarrollo local

- `npm run dev`: Vite sirve también `/api/tasks/summary-email` (plugin `server/viteDevApi.ts`), leyendo las variables del
  servidor desde `.env.local`. Sin ellas responde 503 `not_configured`.
- Alternativa fiel a producción: `npx vercel dev` (requiere cuenta y `vercel link`).
- Los tests (`npm test`) usan dobles de AWS y Firebase Admin; no envían correos reales.

## Limitaciones conocidas

- La app no tiene flujo de verificación de correo: las cuentas email/contraseña no verificadas verán el botón
  deshabilitado; las de Google (verificadas) pueden usarlo.
- Más de 500 tareas: el resumen cubre las primeras 500 y lo indica.
- Envío real no verificado aún (sin credenciales AWS/Firebase Admin en este entorno).

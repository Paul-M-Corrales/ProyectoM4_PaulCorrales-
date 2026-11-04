# Resumen de tareas por correo (AWS SES + Vercel Functions)

Endpoint: `POST /api/tasks/summary-email` (archivo `api/tasks/summary-email.ts`, lógica en `server/`).

## Flujo

1. El navegador envía `Authorization: Bearer <Firebase ID Token>` y `X-Requested-With: ongoing-web`, sin cuerpo (si llega uno, no se lee).
2. El servidor verifica el token con Firebase Admin; de ahí salen el UID y el destinatario (correo **verificado** de la cuenta).
3. Reserva el envío en `emailRateLimits/{uid}` (transacción de Firestore: 60 s entre envíos, 5 por día UTC).
4. Lee solo `users/{uid}/tasks` (ver «Contadores y lista»), arma el resumen y lo envía por SES.
5. Responde 202 `accepted`. SES acepta el mensaje; no garantiza la entrega a la bandeja de entrada.

## Contadores y lista (sin tope de 500)

- **Contadores globales y exactos** con agregaciones `count()` de Firestore (no leen documentos): total, `completed == true`
  y `completed == false`. Porcentaje = completadas / total.
- Tareas sin un `completed` booleano (datos antiguos) = total − completadas − pendientes: se **declaran aparte** en el correo,
  no se cuentan ni como hechas ni como pendientes.
- **Lista del correo**: una consulta acotada a 100 pendientes (`LIST_POOL`); de ellas se muestran hasta 25 (`MAX_LISTED`),
  ordenadas por vencimiento (sin fecha al final) y luego prioridad alta > media > baja. Las 100 candidatas son las primeras
  por id de documento, así que con más de 100 pendientes la lista es una **muestra**, no «las más urgentes de todas».
- Si hay pendientes fuera de la lista, el correo dice «Mostrando N de M pendientes» y cuántas no están incluidas.
- Los títulos se recortan a 120 caracteres (igual que las reglas) y todo texto se escapa en el HTML.
- Si falla cualquier consulta no se envía nada (respuesta 500 genérica): nunca se mandan cifras parciales.
- No requiere índices compuestos (solo filtros de igualdad sobre un campo).

## Verificación del correo (Firebase Authentication)

El servidor exige `email_verified` en el token. Las cuentas Email/Contraseña sin verificar ven un aviso con:
«Enviar correo de verificación» (`sendEmailVerification` de Firebase, con espera de 60 s para reenviar; Firebase aplica
además su propio límite) y «Ya verifiqué mi correo» (`reload()` + `getIdToken(true)`, porque el token cacheado conserva
el valor anterior). Ese correo lo envía Firebase, **no** SES: SES envía solo los resúmenes.

## Cuota cuando SES falla

La reserva (60 s / 5 por día) **se conserva** aunque SES falle. Motivo: el enfriamiento de 60 s es la defensa contra
reintentos en bucle, y devolver la cuota exigiría una segunda escritura que puede fallar. Coste: tras un error de SES el
usuario espera hasta 60 s para reintentar (y gasta 1 de sus 5 diarios). Está cubierto por un test.

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
- Los tests (`npm test`, `npm run test:rules`) usan dobles de AWS y Firebase Admin o el emulador; no envían correos reales.

## Limitaciones conocidas

- `verifyIdToken` no usa `checkRevoked`: un token revocado sigue siendo válido hasta que expire (máx. 1 hora).
- Un fallo de configuración de Firebase Admin se ve como 401 para el usuario; el log del servidor registra solo el tipo de error.
- Envío real no verificado aún: requiere una prueba posterior al despliegue.

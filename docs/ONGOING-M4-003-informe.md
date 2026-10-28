# ONGOING-M4-003 — Autenticación con Firebase

## Arquitectura
- `lib/firebase/config.ts` lee `VITE_FIREBASE_*` y devuelve la config o solo los **nombres** faltantes.
- `lib/firebase/client.ts` inicializa la app una vez (`getApps()`); persistencia de sesión a cargo del SDK.
- `features/auth/types.ts` define `AuthGateway` (login, registro, Google, reset, `signOut`, `onAuthChange`).
- `services/firebaseAuthGateway.ts` implementa el contrato; `unconfiguredAuthGateway.ts` se usa sin config
  (nunca simula sesiones); `createAuthGateway.ts` elige uno u otro.
- `context/AuthProvider` suscribe `onAuthStateChanged` y es la única fuente de sesión
  (`loading | authenticated | unauthenticated`); cancela el observer al desmontar.
- `utils/firebaseErrors.ts` traduce códigos a español; unifica credenciales inválidas y el reset responde igual
  exista o no la cuenta (anti-enumeración).
- `app/routes/`: `ProtectedRoute`, `PublicOnlyRoute`, `SessionLoading`.

## Rutas
`/` login · `/registro` · `/recuperar-password` · `/dashboard` (privada) · `*` → `/`.

## Pasos manuales en Firebase Console
Authentication → Sign-in method: Email/Password y Google habilitados; Settings → Authorized domains: `localhost`
(y el dominio de producción al publicar). Recomendado: activar la protección contra enumeración de correos.

## Límite para Firestore
Las rutas privadas son solo UX. Los datos deberán protegerse con reglas de seguridad de Firestore.

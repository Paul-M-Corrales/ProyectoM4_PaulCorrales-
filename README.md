# On-going

Proyecto Integrador M4 (Soy Henry). Base React + TypeScript con mascota 3D (conejo) lista para el login cinematográfico.

## Requisitos

Node 20+ (probado con Node 24) y npm.

## Comandos

```powershell
npm install
npm run dev          # http://localhost:5173 (login) · /dev/mascot solo existe en desarrollo
npm run lint
npm run typecheck
npm run test
npm run check:lines  # falla si algún archivo de código supera 150 líneas
npm run check:glb    # verifica los 8 clips de public/mascot/rabbit.glb
npm run build
npm run validate     # todo lo anterior en cadena
```

## Estructura

```
src/app/                 rutas
src/features/auth/       login: componentes, validación, hook y gateway (pendiente de Firebase)
src/features/intro/      secuencia cinematográfica: fondo, escenario del conejo, movimiento, orquestador
src/features/mascot/     componente <Mascot />, contratos, clips, secuencias
src/features/mascot/dev/ laboratorio de clips (ruta /dev/mascot)
src/hooks/  src/lib/     utilidades transversales
src/styles/              tokens de diseño y base global
public/mascot/           rabbit.glb (modelo con 8 clips)
tests/                   Vitest + Testing Library
scripts/                 validadores (líneas, GLB)
```

Las carpetas `components/ui`, `features/auth|tasks|dashboard|notifications`, `services`, `types` y `utils`
se crean cuando un ticket las necesite (sin carpetas vacías).

## Regla de 150 líneas

Ningún archivo de código (TS, TSX, JS, CSS, scripts, tests) puede superar 150 líneas. Lo valida `npm run check:lines`.

## Mascota

```tsx
<Mascot clip="idle" label="Conejo mascota de On-going" onClipFinished={...} />
```

Clips: `walk`, `stop`, `point`, `idle`, `ride`, `ride-idle`, `ride-mount`, `ride-celebrate`.
Secuencia de login: `LOGIN_SEQUENCE` (walk → stop → point → idle) con `useClipSequence`.
Estados: loading, ready, error y unsupported (sin WebGL), todos con fallback accesible.

## Login cinematográfico

Ruta `/`. Secuencia: apertura → walk (desplazamiento real) → stop → point (revela el formulario) → idle.
Se reproduce una vez por sesión (`sessionStorage`), se omite con el botón o con `prefers-reduced-motion`, y si la mascota
no carga (sin WebGL o error) el formulario aparece directamente. La autenticación usa `pendingAuthGateway`:
informa que Firebase llega en ONGOING-M4-003 y no simula sesiones.

## Seguridad

Sin credenciales en el repositorio. `.env*` está ignorado salvo `.env.example`. Firebase, AWS SES y Vercel llegan en tickets posteriores.

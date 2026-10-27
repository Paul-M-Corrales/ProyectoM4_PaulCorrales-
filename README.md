# On-going

Proyecto Integrador M4 (Soy Henry). Base React + TypeScript con mascota 3D (conejo) lista para el login cinematográfico.

## Requisitos

Node 20+ (probado con Node 24) y npm.

## Comandos

```powershell
npm install
npm run dev          # http://localhost:5173 (laboratorio: /dev/mascot)
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
src/app/                 rutas y páginas de aplicación
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

## Seguridad

Sin credenciales en el repositorio. `.env*` está ignorado salvo `.env.example`. Firebase, AWS SES y Vercel llegan en tickets posteriores.

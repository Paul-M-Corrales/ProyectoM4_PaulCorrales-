# ONGOING-M4-002 — Login cinematográfico

Base: `main` @ `912dd8d` (limpio). Ruta `/` = login. `/dev/mascot` solo existe con `npm run dev`
(`import.meta.env.DEV`); el build de producción no contiene la página ni su chunk y esa URL cae al login.

## Secuencia

1. Apertura (1,2 s mínimo + espera a que la mascota esté `ready`): fondo fucsia con blobs, vetas, rejilla y anillos.
2. `walk` (3 ciclos): entra desde fuera del borde izquierdo con velocidad constante. Zancada configurada en
   `introTimeline.ts` (`STRIDE_PER_CYCLE`), proporcional a la altura del escenario.
3. `stop`: frenado suave de los últimos 0,18 alturas.
4. `point`: el brazo apunta hacia la derecha, donde está el formulario (verificado en el laboratorio).
5. A los 450 ms de `point` se revela el panel (escala, rotación 3D, desenfoque, estallido de luz y onda).
6. `idle` en bucle. Nunca se repite sola.

Omitir (botón), `prefers-reduced-motion`, intro ya vista en la sesión, o fallo de la mascota → estado final directo
con el login visible. Omitir en mitad de una transición detiene el movimiento y deja todo en idle.

## Reutilizado / nuevo

Reutilizado: `<Mascot>`, `LOGIN_SEQUENCE`, `useClipSequence`, tokens, validadores.
Nuevo: `features/intro` (orquestador, movimiento, escenario, fondo, omitir) y `features/auth`
(componentes, validación, `useLoginForm`, `AuthGateway` + `pendingAuthGateway`).

## Corrección en la mascota (ONGOING-M4-001)

`MascotModel` liberaba el GLB en el cleanup del efecto; en desarrollo (StrictMode) eso vaciaba la caché y cada cambio
de clip volvía a suspender y **ocultaba la mascota** durante la recarga. Ahora la liberación es diferida y solo ocurre
si el componente realmente se desmonta.

## Verificación

Lint, typecheck, 36 tests, `check:lines` (69 archivos, máximo 150), `check:glb` y build: OK (`npm run validate`).
Chrome headless con render por software: estado final en 320, 375, 768 y 1440 px sin scroll horizontal; el panel
cabe en el ancho en todos; `point` mostrado en el laboratorio; build de producción renderiza al conejo sin errores
de consola y la recarga no repite la intro. Capturas en `docs/screens/login-*.png`.

## Limitaciones

- No pude capturar fotogramas intermedios fiables de la caminata ni del estallido de luz (la captura headless de WebGL
  es irregular); **no verifiqué la fluidez ni la ausencia de patinaje**. `STRIDE_PER_CYCLE` es una estimación a ajustar
  viendo el movimiento en un navegador real.
- Sin GPU real: rendimiento no medido. El fondo usa blur y filtros costosos; revisar en móviles.
- Firebase pendiente: todas las acciones muestran el aviso de integración.
- El chunk de three sigue pesando ~1 MB (carga diferida).

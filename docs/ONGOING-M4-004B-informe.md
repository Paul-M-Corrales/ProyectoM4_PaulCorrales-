# ONGOING-M4-004B — Rediseño visual con la identidad aprobada

Referencias oficiales (extraídas de `.zip/Referencias-On-going-aprobadas.zip`, solo los dos PNG):
`docs/referencias/Inicio-aprobado.png` y `docs/referencias/Mis-tareas-aprobado.png`.

## Sistema de diseño (`src/styles/ds/`)
`colors.css`, `typography.css` (Plus Jakarta Sans Variable, OFL, autoalojada vía `@fontsource-variable`),
`layout.css` (espaciado, radios, sombras, bordes, breakpoints 480/768/1024/1280), `motion.css`,
`app-shell.css` (tema claro acotado a `.ds-app`; el login conserva su tema). Componentes base en
`src/components/ui/` (`Button`, `ButtonLink`, `ButtonAnchor`, `Eyebrow`, `Icon`).

## Animación `welcome`
Clip procedural sobre el rig Mixamo real (sin modificar el GLB ni los demás clips):
`features/mascot/welcome/` (`welcomePose` = poses por hueso, `buildWelcomeClip` = pistas de cuaterniones
a 30 fps sobre el reposo de idle, `useWelcomeOverlay` = capa con fundido sobre idle).
Secuencia: entra (fundido/escala CSS) → saludo con el brazo derecho (antebrazo y mano oscilan) → puño
con el brazo izquierdo (dedos flexionados, dos impulsos) → vuelve a postura natural → `idle`.
Verificada con fotogramas intermedios (`docs/screens/m4-004b-welcome-frames.png`). Con reduced-motion se
salta directamente a `idle`. Límite: el pulgar de la mano del puño no se cierra del todo.

## Bicicleta
Se reutilizan `ride-mount`, `ride-idle`, `ride`, `ride-celebrate` y la prop `speed` (M4-004).
Laboratorio aislado `/dev/ride` (solo desarrollo) intacto.

## Diferencias que persisten frente a los bocetos
- Las tarjetas flotantes de Inicio y las maquetas de las tres tarjetas son ilustrativas (se rotulan
  «Ilustración de ejemplo» y están `aria-hidden`); en Mis tareas no se muestran 12 tareas, 33 %, 80 % ni
  racha de 5 días porque no hay datos reales: se ven ceros y estados vacíos.
- El botón «Comenzar ahora» del boceto es «Nueva tarea» (usuario autenticado).
- El conejo del panel de Mis tareas es algo más pequeño y está más centrado que en el boceto (limitado por la
  altura del viewport y la cámara compartida).
- Drag & drop, vista Tablero y persistencia están preparados pero deshabilitados hasta el ticket Firestore.

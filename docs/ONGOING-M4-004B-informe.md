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

## ONGOING-M4-004C (corrección)
- **Acceso directo a Inicio:** no se perdió el registro. Firebase Auth conserva la sesión (persistencia por
  defecto del SDK, IndexedDB) y `PublicOnlyRoute` redirige a Inicio a quien ya la tiene, incluido `/registro`.
  Sin sesión, el login muestra «Crear cuenta» → `/registro`. Se mantuvo ese comportamiento (documentado y
  cubierto por `tests/auth/accessFlow.test.tsx`). Para ver el registro: cerrar sesión desde el menú de cuenta.
- Inicio: eliminadas todas las tarjetas flotantes y sus cifras; formas geométricas reubicadas detrás del conejo,
  lejos de manos y cara; escenario ampliado (`inset: -10% 0 -2%`) para ver brazos, puño, cara y orejas.

## ONGOING-M4-004D (pulgar arriba + puño)
Causa de los brazos «quebrados»: el saludo levantaba el brazo a ~108° de abducción con el antebrazo a 88°, lo
que arrugaba la manga y el hombro. Nueva secuencia con abducción moderada (60°) y codo ~95°.
Huesos: `mixamorig{Right,Left}{Arm,ForeArm,Hand}`, `…HandThumb1/2`, `…Hand{Index,Middle,Ring,Pinky}1-3`,
`Spine2`, `Neck`, `Head` (+ escala de mano ×1,25 como énfasis). Ejes calibrados con rejillas de poses: Z de
brazo/antebrazo abre y flexiona (espejado en el izquierdo); Z de dedos cierra; Z negativo del pulgar derecho lo
levanta, positivo lo remete. Secuencia (5,6 s): sube el brazo derecho → pulgar arriba sostenido (~1,6 s) →
baja y sube el puño izquierdo → dos impulsos → reposo. Solo en Inicio; reduced-motion muestra `idle`.
Limitación: el pulgar del conejo es fino; se refuerza con escala de mano (animada, no destructiva).

## ONGOING-M4-004E (pulgar arriba, solo brazo derecho)
Referencia: `docs/referencias/Conejo cool con pulgar arriba.png`. `welcome` quedó reducido a una sola acción:
sube el brazo derecho (arm 38°, codo 128°), cierra los 4 dedos, extiende el pulgar, sostiene ~2 s y vuelve a idle.
Huesos: `mixamorigRight{Arm,ForeArm,Hand,HandThumb1,HandThumb2}` y `mixamorigRightHand{Index,Middle,Ring,Pinky}1-3`.
Eliminados: saludo, puño, impulsos, brazo izquierdo, torso/cuello/cabeza y el escalado de manos. El clip solo
contiene rotaciones. Comparación: `docs/screens/m4-004e-referencia-vs-glb.png`.
Diferencias con la imagen: el puño del GLB es más delgado y el antebrazo queda algo más abierto hacia fuera.

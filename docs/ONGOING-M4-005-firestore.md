# ONGOING-M4-005 — Firestore CRUD, progreso real y bicicleta

## Arquitectura
| Capa | Archivos |
| --- | --- |
| Configuración | `src/lib/firebase/client.ts` (`getFirebaseDb`), `config.ts` |
| Contrato | `features/tasks/services/taskRepository.ts` (+ repositorio «sin conexión» honesto) |
| Firestore | `services/firestoreTaskRepository.ts`, `taskMapper.ts`, `firestoreErrors.ts`, `createTaskRepository.ts` |
| Inyección | `context/taskRepositoryContext.ts`, `hooks/useTaskRepository.ts` (el uid sale de la sesión de `useAuth`) |
| Estado | `hooks/useTasks.ts` (`onSnapshot`, `loading/ready/error`), `useTaskFeedback.ts`, `useTaskView.ts` |
| Progreso | `logic/taskFilters.ts#progressOf` (sobre **todas** las tareas, no las visibles) |
| Bicicleta | `mascot/ride/{rideProgress,celebration,useRideMascot}.ts` |

## Modelo y fechas
Ruta: `users/{uid}/tasks/{taskId}`. El uid **no** se guarda en el documento: la propiedad la fija la ruta.
Campos: `title` (1–120), `description` (≤500), `priority` (`alta|media|baja`), `dueDate`, `completed`, `order`,
`createdAt`, `updatedAt`.
- `dueDate` es **texto `AAAA-MM-DD`** (día de calendario). No es un instante: así no hay desfases de zona horaria.
- `createdAt` / `updatedAt` son `Timestamp` del **servidor** (`serverTimestamp()`), no del reloj del cliente.
- `order` = `Date.now()` al crear; reservado para el drag & drop.

## Reglas de seguridad (`firestore.rules`)
Solo `users/{uid}/tasks/{taskId}`; todo lo demás queda denegado por defecto.
- Leer/eliminar: `request.auth.uid == uid`.
- Crear/editar: además, forma exacta del documento (`hasOnly` + `hasAll`), tipos y tamaños, `updatedAt == request.time`.
- Crear: `createdAt == request.time`. Editar: `createdAt` inmutable.

### Aplicar las reglas (acción del Product Owner — NO se publicaron)
1. En Firebase Console → Firestore Database: si aún no existe, **Crear base de datos** (hoy la API responde
   «Cloud Firestore API has not been used / is disabled» para el proyecto: es un paso manual).
2. Revisar las reglas actuales en la pestaña **Reglas**. `firebase deploy --only firestore:rules` las **reemplaza por
   completo**; si hay reglas para otras colecciones, hay que fusionarlas antes.
3. Publicar: `npx firebase-tools deploy --only firestore:rules --project <id-del-proyecto>` (o pegar el contenido de
   `firestore.rules` en la consola y pulsar Publicar).
4. Validar: pestaña Reglas → Simulador (usuario A lee `users/A/tasks/x` ✔, usuario B lo mismo ✘, sin auth ✘).

## Pruebas
- `npm run validate`: 145 tests (UI, hooks, repositorio con SDK simulado, celebración, filtros, orden).
- `npm run test:rules`: **7 pruebas contra Firebase Emulator Suite** (necesita Java y descarga el emulador la primera vez).
  Cubren A crea/lee/edita/elimina; B no lee/lista/edita/elimina/crea en la ruta de A; anónimo denegado; datos
  inválidos; `createdAt` inmutable; rutas no declaradas.
- Los tests de la app son herméticos: `tests/setup.ts` anula las variables `VITE_FIREBASE_*` para no tocar el backend real.

## Drag & drop
**No implementado** (subticket posterior). El control sigue deshabilitado y rotulado «todavía no disponible».
Requiere reordenar dentro de los grupos por vencimiento, renumerar `order` en lote y accesibilidad por teclado.

## Progreso y bicicleta
`porcentaje = completadas / total` (sin tareas: 0 %). 0 % → `ride-idle`; parcial → `ride` con velocidad 0,6–2,2×
(la velocidad converge gradualmente en `MascotModel`); 100 % → `ride` a velocidad máxima.
`ride-celebrate` se dispara **una vez** solo si: los datos ya cargaron, antes estaba incompleto, ahora completo,
subió el número de completadas y el total no cambió (no celebra al cargar, sin tareas, al borrar, ni al filtrar).
Al cambiar de usuario (`resetKey = uid`) se reinicia el estado transitorio. Con reduced-motion no hay celebración.

## Protocolo de verificación manual con Firebase real (PENDIENTE de ejecutar)
Requisito: Firestore creado y reglas publicadas; dos cuentas de prueba (A y B).
1. Entrar como A → Mis tareas → crear una tarea → aparece y el anillo dice 0/1.
2. Refrescar (F5) → la tarea persiste.
3. Editarla (título/prioridad/fecha) → el cambio se ve y sobrevive a F5.
4. Marcarla completada → anillo 1/1 y la bicicleta celebra una vez; F5 → **no** vuelve a celebrar.
5. Abrir una segunda pestaña como A → un cambio en una se refleja en la otra sin recargar.
6. Cerrar sesión; entrar como B → lista vacía, sin tareas de A.
7. Volver a A → sus tareas siguen ahí.
8. Eliminar una tarea (confirmar) → desaparece y el total baja sin celebrar.

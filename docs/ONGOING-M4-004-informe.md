# ONGOING-M4-004 — Pantallas Inicio y Mis tareas

## Mascota: verificación de recursos
| Recurso | GLB | Clips | Bicicleta |
|---|---|---|---|
| `conejo3dIn.zip` → `public/mascot/rabbit.glb` | 981–994 KB | walk, stop, point, idle | No |
| `conejo3dOut.zip` → `assets/mascot/v3-ride/rabbit.glb` | 1,2 MB | + ride, ride-idle | Sí |
| `conejo3dOut.zip` → `public/mascot/rabbit.glb` | 1,4 MB (MD5 `2895d282…`) | los 8 | Sí |
| GLB integrado en el proyecto | idéntico (MD5) al anterior | los 8 | Sí |

Discrepancia: el ZIP `In` contiene el conejo base **sin** bicicleta; los clips `ride*` solo existen en `Out`.
Es el mismo personaje (`M_Rabbit`, `M_Hands`, `M_Whiskers`, mismo `geometry_0`) más los nodos `Bike*`,
así que se usa el GLB integrado (= `Out` final) sin sustituir modelos.

## Rutas
`/inicio`, `/tareas`, `/reportes`, `/configuracion` (todas privadas, bajo `AppLayout`); `/dashboard` → `/inicio`.
Solo en desarrollo: `/dev/mascot` y `/dev/ride` (modo de prueba aislado del pedaleo).

## API del pedaleo (`features/mascot/ride`)
`rideStateFor({ total, completed })` → 0 % o sin tareas: `ride-idle`; parcial: `ride` con velocidad 0,6×–2,2×;
100 %: `ride-celebrate`. `RideMascot` recibe el progreso por props y sube a la bici con `ride-mount` una vez.

## Preparado para Firestore
`features/tasks`: tipos (`Task`, `TaskDraft`), contrato `TaskRepository`, `useTasks` (hoy repositorio
«no conectado»: lista vacía, crear/editar/borrar devuelven un aviso honesto). El siguiente ticket solo inyecta
la implementación de Firestore.

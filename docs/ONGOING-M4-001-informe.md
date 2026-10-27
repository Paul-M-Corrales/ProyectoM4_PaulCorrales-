# ONGOING-M4-001 — Informe técnico

- Proyecto: On-going · Ticket: ONGOING-M4-001 · Tipo: creación de proyecto desde cero
- Ruta: `C:\Users\paulm\OneDrive\Escritorio\Soy Henry\M4` · Git: repositorio nuevo local, rama `main`

## Modelo GLB

Se usó `conejo3dOut.zip › public/mascot/rabbit.glb` (1 404 204 bytes, SHA-256
`BE657711AD995BC854D42C5098CF0031C2375055F34D31203251F7303C3A7C64`), leído directamente del GLB:

| Clip | Duración |
| --- | --- |
| walk | 1.03 s |
| stop | 0.53 s |
| point | 1.23 s |
| idle | 3.03 s |
| ride | 1.03 s |
| ride-idle | 3.03 s |
| ride-mount | 3.33 s |
| ride-celebrate | 3.50 s |

`conejo3dIn` contiene solo walk/stop/point/idle (994 364 bytes, sin bicicleta). Se descartó por incompleto.
Compresión: EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization (drei los decodifica).
El nodo `Bike` agrupa la bicicleta; se muestra solo en clips `ride*`.

## Seguridad aplicada

Se listaron los ZIP sin extraerlos completos. Solo se extrajo `rabbit.glb` y se leyó el GLB como datos, desde un
directorio temporal fuera del proyecto. No se abrió ni copió ningún `.env`, no se ejecutó código de los ZIP, y no se
copió código, dependencias ni configuración antigua. Todo el código es nuevo.

## Verificación visual

Chrome headless (SwiftShader) sobre `/dev/mascot`: estado `ready`, la secuencia avanzó walk → idle sin errores de
consola y `ride-celebrate` mostró al conejo sobre la bicicleta. Capturas en `docs/screens/`.
No se verificó en GPU real, ni la fluidez de las animaciones (solo capturas fijas y el estado del DOM).

## Decisiones

- El mixer de animación se gestiona directamente con `AnimationMixer` de three: `useAnimations` de drei dejaba la
  acción inactiva bajo StrictMode al desmontar/remontar.
- `normalizeModel` escala y centra el modelo (bounding box de piel) para no depender de `Bounds`, que recortaba la cabeza.
- Ruta `/dev/mascot` siempre disponible; se retirará o protegerá cuando exista el login.

## Pendientes

- La caja de encuadre se calcula en pose de reposo; revisar al integrar el dashboard con bicicleta.
- `three` pesa ~1 MB en el chunk lazy de la mascota (265 kB gzip).
- No hay tests de render WebGL (jsdom no lo soporta); la comprobación fue manual con navegador.

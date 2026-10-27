import { Box3, Vector3, type Object3D } from 'three'

/** Altura objetivo en unidades de escena; la cámara del Canvas está calibrada para ella. */
export const TARGET_HEIGHT = 2.3

/** Escala el modelo a TARGET_HEIGHT y lo centra en el origen (sobre la pose de reposo). */
export function normalizeModel(model: Object3D): void {
  model.updateMatrixWorld(true)
  const box = new Box3().setFromObject(model, true)
  const size = box.getSize(new Vector3())
  if (size.y === 0) return
  const scale = TARGET_HEIGHT / size.y
  const center = box.getCenter(new Vector3())
  model.scale.multiplyScalar(scale)
  model.position.sub(center.multiplyScalar(scale))
}

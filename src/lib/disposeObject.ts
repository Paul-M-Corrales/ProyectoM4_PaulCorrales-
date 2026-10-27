import { Material, Mesh, type Object3D, type Texture } from 'three'

function disposeMaterial(material: Material) {
  for (const value of Object.values(material)) {
    if ((value as Texture | null)?.isTexture) (value as Texture).dispose()
  }
  material.dispose()
}

/** Libera geometrías, materiales y texturas de un árbol Object3D. */
export function disposeObject(root: Object3D): void {
  root.traverse((node) => {
    if (!(node as Mesh).isMesh) return
    const mesh = node as Mesh
    mesh.geometry.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach((m) => m instanceof Material && disposeMaterial(m))
  })
}

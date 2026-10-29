const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Escalón suave 0→1 entre a y b. */
export function smooth(a: number, b: number, t: number): number {
  const x = clamp01((t - a) / (b - a))
  return x * x * (3 - 2 * x)
}

/** Meseta 0→1→0: sube entre a0–a1 y baja entre b0–b1. */
export function plateau(a0: number, a1: number, b0: number, b1: number, t: number): number {
  return smooth(a0, a1, t) - smooth(b0, b1, t)
}

/** Seno con periodo en segundos, medido desde start. */
export function wave(t: number, start: number, period: number): number {
  return Math.sin(((t - start) * 2 * Math.PI) / period)
}

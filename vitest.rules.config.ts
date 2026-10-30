import { defineConfig } from 'vitest/config'

/** Pruebas de las reglas de Firestore: requieren el emulador (`npm run test:rules`). */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20_000,
    fileParallelism: false,
  },
})

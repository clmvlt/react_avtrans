import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Les tests portent sur des dates locales (jour de rattachement d'un service de nuit) : on les
// exécute à l'heure de Paris, quel que soit le fuseau de la machine.
process.env.TZ = 'Europe/Paris'

// Tests unitaires des fonctions pures (`src/lib`, `src/features/*/lib`), sans DOM.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})

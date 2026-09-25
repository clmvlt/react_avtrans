import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Version unique de l'application : package.json fait foi (incrémenté par deploy/deploy.py).
// Elle est injectée dans le bundle (__APP_VERSION__, voir src/config/version.ts).
const APP_VERSION: string = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
).version

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  plugins: [
    // React Compiler : mémoïsation automatique, donc pas de useMemo/useCallback défensifs.
    react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})

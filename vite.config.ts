import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'

// Version unique de l'application : package.json fait foi (incrémenté par deploy/deploy.py).
// Elle est injectée dans le bundle (__APP_VERSION__, voir src/config/version.ts) et écrite
// dans dist/version.json ; le client compare les deux pour détecter un redéploiement.
const APP_VERSION: string = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'),
).version

const gitCommit = () => {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
  } catch {
    return null
  }
}

// Génère dist/version.json à la fin du build. Ce fichier doit être servi sans cache
// (voir deploy/apache-cache-headers.conf).
const versionPlugin = (): Plugin => ({
  name: 'version-generator',
  apply: 'build',
  writeBundle(options) {
    const outDir = options.dir || path.resolve(__dirname, 'dist')
    const versionInfo = {
      version: APP_VERSION,
      buildTime: new Date().toISOString(),
      commit: gitCommit(),
    }
    fs.writeFileSync(path.join(outDir, 'version.json'), JSON.stringify(versionInfo, null, 2) + '\n')
    console.log(`✓ version.json generated (v${APP_VERSION})`)
  },
})

// ── Sitemap ──────────────────────────────────────────────────────────────────
// Seules la landing et la page de connexion sont indexables (voir public/robots.txt).
// <lastmod> = date du dernier commit touchant les fichiers de la page (repli : date du build).
const SITE_URL = 'https://pointage.avtrans-concept.com'
const SITEMAP_PAGES = [
  {
    loc: '/',
    sources: ['index.html', 'src/pages/landing', 'src/features/landing', 'src/assets/images'],
    changefreq: 'monthly',
    priority: '1.0',
  },
  {
    loc: '/login',
    sources: ['src/pages/auth/LoginPage.tsx'],
    changefreq: 'yearly',
    priority: '0.3',
  },
]

const lastCommitDate = (sources: string[]) => {
  try {
    const quoted = sources.map((s) => `"${s}"`).join(' ')
    const out = execSync(`git log -1 --format=%cI -- ${quoted}`, {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
    return out ? out.slice(0, 10) : null
  } catch {
    return null
  }
}

const sitemapPlugin = (): Plugin => ({
  name: 'sitemap-generator',
  apply: 'build',
  writeBundle(options) {
    const outDir = options.dir || path.resolve(__dirname, 'dist')
    const today = new Date().toISOString().slice(0, 10)
    const urls = SITEMAP_PAGES.map((page) => {
      const lastmod = lastCommitDate(page.sources) || today
      return [
        '  <url>',
        `    <loc>${SITE_URL}${page.loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${page.changefreq}</changefreq>`,
        `    <priority>${page.priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
      '',
    ].join('\n')
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml)
    console.log(`✓ sitemap.xml generated (${SITEMAP_PAGES.length} URLs)`)
  },
})

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  plugins: [
    // React Compiler : mémoïsation automatique, donc pas de useMemo/useCallback défensifs.
    react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
    tailwindcss(),
    versionPlugin(),
    sitemapPlugin(),
    // Pré-compression des assets au build (.gz + .br servis par Apache, comme le Vue) ;
    // scripts/prerender.cjs régénère ensuite ceux d'index.html
    compression({ algorithms: ['gzip', 'brotliCompress'] }),
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
  build: {
    // mapbox-gl (~1,8 Mo, chargé seulement par les cartes) est le seul chunk au-delà des
    // 500 ko par défaut : limite relevée pour lui, les autres chunks restent bien en dessous
    chunkSizeWarningLimit: 1900,
    rollupOptions: {
      output: {
        manualChunks: {
          // Cœur React, commun à toutes les pages : chunk stable d'un déploiement à l'autre
          // (équivalent du `vue-vendor` du Vue)
          'react-vendor': ['react', 'react-dom', 'react-dom/client', 'react-router', 'scheduler'],
        },
      },
    },
  },
})

#!/usr/bin/env node
'use strict'
/**
 * Pré-rendu statique de la landing page (« / ») après `vite build`.
 *
 * Pourquoi : l'application est une SPA. Sans pré-rendu, les moteurs de recherche reçoivent un
 * index.html vide (<div id="app"></div>) et doivent exécuter le JavaScript pour découvrir le
 * contenu — ce que Google fait avec retard et que d'autres robots (Bing, réseaux sociaux,
 * assistants IA) ne font pas toujours.
 *
 * Principe : on sert dist/ localement, on ouvre « / » dans Edge ou Chrome en mode headless
 * (piloté via le Chrome DevTools Protocol, sans dépendance npm), on récupère le HTML rendu de
 * la landing et on l'injecte dans dist/index.html (ainsi que ses variantes .gz / .br).
 *
 * Côté client, rien ne change : React (createRoot, pas hydrateRoot) remplace le contenu du
 * conteneur au montage puis rend la page normalement. Un petit script inline vide le conteneur
 * sur les autres routes (ex. /login) pour ne pas y afficher la landing avant le montage.
 *
 * Métadonnées (MIGRATION.md, décision D2) : <title>, description, robots et canonical sont rendus
 * par React 19 (PageMeta) et ne figurent plus dans index.html. Le script recopie ceux de la
 * landing dans le <head> de dist/index.html (marqués data-prerender-head) pour les robots qui
 * n'exécutent pas le JavaScript ; le script inline les retire avant le montage, React rendant
 * ensuite ceux de la page affichée (sans doublon).
 *
 * En cas d'échec (navigateur introuvable, délai dépassé…), un avertissement est affiché et le
 * build reste valide (index.html vide comme avant). PRERENDER_STRICT=1 rend l'échec bloquant.
 * PRERENDER_BROWSER=<chemin> force l'exécutable du navigateur.
 */
const fs = require('node:fs')
const path = require('node:path')
const http = require('node:http')
const os = require('node:os')
const zlib = require('node:zlib')
const { spawn, spawnSync } = require('node:child_process')

const DIST = path.resolve(__dirname, '..', 'dist')
const INDEX_FILE = path.join(DIST, 'index.html')
const ROUTE = '/'
const VIEWPORT = { width: 1440, height: 900 }
const GLOBAL_TIMEOUT_MS = 90_000
const STRICT = process.env.PRERENDER_STRICT === '1'

const MARK_START = '<!--prerender:start-->'
const MARK_END = '<!--prerender:end-->'
const HEAD_MARK_START = '<!--prerender-head:start-->'
const HEAD_MARK_END = '<!--prerender-head:end-->'
const EMPTY_ROOT = '<div id="app"></div>'
/**
 * Retire les métadonnées pré-rendues (React rendra celles de la page affichée) ; vide le
 * conteneur hors de « / » ; sur « / », signale à la landing que le contenu est déjà affiché.
 */
const BOOT_SCRIPT =
  '<script data-prerender>document.querySelectorAll("[data-prerender-head]").forEach(function(e){e.remove()});if(location.pathname==="/"){window.__PRERENDERED__=true}else{document.getElementById("app").replaceChildren()}</script>'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
}

const BROWSER_CANDIDATES = [
  process.env.PRERENDER_BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

const log = (msg) => console.log(`[prerender] ${msg}`)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const findBrowser = () =>
  BROWSER_CANDIDATES.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile()
    } catch {
      return false
    }
  }) ?? null

/** Serveur statique minimal sur dist/ avec repli SPA vers index.html (comme Apache en prod). */
const startStaticServer = () =>
  new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      let file = path.normalize(path.join(DIST, pathname))
      if (!file.startsWith(DIST)) {
        res.writeHead(403)
        res.end()
        return
      }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = INDEX_FILE
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      })
      fs.createReadStream(file).pipe(res)
    })
    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }))
  })

/** Port TCP libre pour le débogage distant du navigateur. */
const freePort = () =>
  new Promise((resolve, reject) => {
    const probe = http.createServer()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
  })

const launchBrowser = (exe, debugPort) => {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'avtrans-prerender-'))
  const child = spawn(
    exe,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-sync',
      '--disable-background-networking',
      '--hide-scrollbars',
      '--mute-audio',
      `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
      `--user-data-dir=${profileDir}`,
      `--remote-debugging-port=${debugPort}`,
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true },
  )
  return { child, profileDir }
}

const killBrowser = ({ child, profileDir }) => {
  if (child.exitCode === null) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        windowsHide: true,
      })
    } else {
      child.kill('SIGKILL')
    }
  }
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 })
  } catch {
    /* profil temporaire : sans importance */
  }
}

const waitForJson = async (url, timeoutMs) => {
  const deadline = Date.now() + timeoutMs
  let lastError = null
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
    } catch (error) {
      lastError = error
    }
    await sleep(150)
  }
  throw new Error(`pas de réponse de ${url} (${lastError?.message ?? 'délai dépassé'})`)
}

/** Client Chrome DevTools Protocol minimal (WebSocket natif de Node ≥ 22). */
class Cdp {
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url)
      ws.addEventListener('open', () => resolve(new Cdp(ws)))
      ws.addEventListener('error', () =>
        reject(new Error(`connexion WebSocket impossible : ${url}`)),
      )
    })
  }

  constructor(ws) {
    this.ws = ws
    this.nextId = 0
    this.pending = new Map()
    this.listeners = new Map()
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data))
      if (message.id !== undefined && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id)
        this.pending.delete(message.id)
        if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`))
        else resolve(message.result)
      } else if (message.method) {
        for (const listener of this.listeners.get(message.method) ?? []) listener(message.params)
      }
    })
  }

  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  once(method) {
    return new Promise((resolve) => {
      const listener = (params) => {
        this.listeners.set(
          method,
          (this.listeners.get(method) ?? []).filter((l) => l !== listener),
        )
        resolve(params)
      }
      this.listeners.set(method, [...(this.listeners.get(method) ?? []), listener])
    })
  }

  async evaluate(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (exceptionDetails) {
      throw new Error(
        exceptionDetails.exception?.description ??
          exceptionDetails.text ??
          'erreur JS dans la page',
      )
    }
    return result.value
  }

  close() {
    this.ws.close()
  }
}

const waitUntil = async (probe, timeoutMs, label) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await probe()) return
    await sleep(100)
  }
  throw new Error(`délai dépassé : ${label}`)
}

/** Ouvre la landing dans le navigateur, déclenche les animations et renvoie le HTML rendu. */
const renderLanding = async (wsUrl, pageUrl) => {
  const cdp = await Cdp.connect(wsUrl)
  try {
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      ...VIEWPORT,
      deviceScaleFactor: 1,
      mobile: false,
    })
    // Thème clair (celui de la landing) et animations réduites : pas de parallaxe (styles inline)
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [
        { name: 'prefers-color-scheme', value: 'light' },
        { name: 'prefers-reduced-motion', value: 'reduce' },
      ],
    })

    const loaded = cdp.once('Page.loadEventFired')
    await cdp.send('Page.navigate', { url: pageUrl })
    await loaded
    // React rend la page (h1) et ses métadonnées (<title> de PageMeta)
    await waitUntil(
      () => cdp.evaluate(`!!document.querySelector('#app h1') && document.title.length > 0`),
      20_000,
      'rendu de la landing (h1 et <title>)',
    )

    // Défilement complet : déclenche les IntersectionObserver (.reveal, compteur des statistiques)
    await cdp.evaluate(`(async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
      const step = Math.max(200, window.innerHeight * 0.6)
      const max = () => document.documentElement.scrollHeight
      for (let y = 0; y <= max(); y += step) { window.scrollTo(0, y); await sleep(100) }
      window.scrollTo(0, max())
      await sleep(2600)
      window.scrollTo(0, 0)
      await sleep(500)
    })()`)
    // Sécurité : tout ce qui n'aurait pas été révélé l'est maintenant
    await cdp.evaluate(
      `document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => el.classList.add('revealed')); true`,
    )

    return await cdp.evaluate(`(() => {
      const root = document.getElementById('app')
      // Balises SEO rendues par React 19 (PageMeta) : index.html ne les contient pas
      const selector = 'title, meta[name="description"], meta[name="robots"], link[rel="canonical"]'
      const head = [...document.head.querySelectorAll(selector)].map((el) => {
        const clone = el.cloneNode(true)
        clone.setAttribute('data-prerender-head', '')
        return clone.outerHTML
      })
      return { html: root ? root.innerHTML : '', title: document.title, head }
    })()`)
  } finally {
    cdp.close()
  }
}

/** Nettoie le HTML capturé : commentaires HTML vides, inutiles côté robots. */
const cleanHtml = (html) => html.replace(/<!---->/g, '')

/** Réinitialise un index.html éventuellement déjà pré-rendu (le script est ré-exécutable). */
const resetIndex = (html) =>
  html
    .replace(new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`, 'g'), '')
    .replace(new RegExp(`\\s*${HEAD_MARK_START}[\\s\\S]*?${HEAD_MARK_END}`, 'g'), '')
    .replace(/\s*<script data-prerender>[\s\S]*?<\/script>/g, '')

const injectIntoIndex = (rendered, headTags) => {
  const original = resetIndex(fs.readFileSync(INDEX_FILE, 'utf8'))
  if (!original.includes(EMPTY_ROOT)) {
    throw new Error(`conteneur ${EMPTY_ROOT} introuvable dans dist/index.html`)
  }
  if (!original.includes('</head>')) throw new Error('</head> introuvable dans dist/index.html')
  const headBlock = [HEAD_MARK_START, ...headTags, HEAD_MARK_END].join('\n    ')
  const html = original
    .replace('</head>', `  ${headBlock}\n  </head>`)
    .replace(
      EMPTY_ROOT,
      `<div id="app">${MARK_START}${rendered}${MARK_END}</div>\n    ${BOOT_SCRIPT}`,
    )
  fs.writeFileSync(INDEX_FILE, html)

  // Variantes pré-compressées (vite-plugin-compression2) : à régénérer, sinon Apache servirait l'ancien contenu
  const buffer = Buffer.from(html)
  if (fs.existsSync(`${INDEX_FILE}.gz`))
    fs.writeFileSync(`${INDEX_FILE}.gz`, zlib.gzipSync(buffer, { level: 9 }))
  if (fs.existsSync(`${INDEX_FILE}.br`)) {
    fs.writeFileSync(
      `${INDEX_FILE}.br`,
      zlib.brotliCompressSync(buffer, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }),
    )
  }
  return html.length
}

const checkRendered = (html) => {
  const required = ['<h1', 'id="services"', 'id="contact"', '<footer']
  const missing = required.filter((token) => !html.includes(token))
  if (missing.length) throw new Error(`HTML capturé incomplet, manque : ${missing.join(', ')}`)
  if (html.includes('<script'))
    throw new Error('le HTML capturé contient un <script>, injection refusée')
  if (html.length < 10_000) throw new Error(`HTML capturé trop court (${html.length} caractères)`)
}

const main = async () => {
  if (!fs.existsSync(INDEX_FILE))
    throw new Error('dist/index.html introuvable : lancer `vite build` avant')

  const exe = findBrowser()
  if (!exe) {
    throw new Error(
      'aucun navigateur Chromium trouvé (Edge/Chrome). Définir PRERENDER_BROWSER=<chemin de l’exécutable>.',
    )
  }
  log(`navigateur : ${exe}`)

  // On sert un index.html vierge pour que le rendu parte de zéro
  fs.writeFileSync(INDEX_FILE, resetIndex(fs.readFileSync(INDEX_FILE, 'utf8')))

  const { server, port } = await startStaticServer()
  const debugPort = await freePort()
  const browser = launchBrowser(exe, debugPort)
  try {
    const pageUrl = `http://127.0.0.1:${port}${ROUTE}`
    log(`rendu de ${pageUrl}`)

    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`, 15_000)
    let targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`, 5_000)
    let page = targets.find((t) => t.type === 'page')
    if (!page) {
      await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })
      targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`, 5_000)
      page = targets.find((t) => t.type === 'page')
    }
    if (!page) throw new Error('aucun onglet disponible dans le navigateur')

    const { html, title, head } = await renderLanding(page.webSocketDebuggerUrl, pageUrl)
    const rendered = cleanHtml(html)
    checkRendered(rendered)
    if (head.length !== 4) {
      throw new Error(`métadonnées de la landing incomplètes (${head.length}/4 balises)`)
    }

    const size = injectIntoIndex(rendered, head)
    log(
      `✓ landing pré-rendue dans dist/index.html (${Math.round(rendered.length / 1024)} Ko de HTML, fichier ${Math.round(size / 1024)} Ko) — titre : ${title}`,
    )
  } finally {
    killBrowser(browser)
    server.close()
  }
}

const timeout = setTimeout(() => {
  console.error(`[prerender] ✗ délai global dépassé (${GLOBAL_TIMEOUT_MS / 1000} s)`)
  process.exit(STRICT ? 1 : 0)
}, GLOBAL_TIMEOUT_MS)

main()
  .then(() => {
    clearTimeout(timeout)
    process.exit(0)
  })
  .catch((error) => {
    clearTimeout(timeout)
    console.error(`[prerender] ${STRICT ? '✗' : '⚠'} ${error.message}`)
    if (!STRICT)
      console.error(
        '[prerender] ⚠ build conservé SANS pré-rendu : la landing sera rendue côté client uniquement (SEO dégradé)',
      )
    process.exit(STRICT ? 1 : 0)
  })

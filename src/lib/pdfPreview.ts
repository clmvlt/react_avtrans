import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

/**
 * Miniatures de la première page d'un PDF (pdf.js), rendues en JPEG sur fond blanc.
 * Port de `composables/usePdfPreview.ts` du Vue, avec trois corrections (MIGRATION.md 8.1) :
 * - worker pdf.js **local** (`?url`, même version que la bibliothèque) au lieu du CDN figé en 4.0.379 ;
 * - `atob` tolérant au préfixe `data:…;base64,` ;
 * - plus de cache de module : le cache est celui de TanStack Query (`usePdfPreview`), avec une clé
 *   fondée sur un hash du contenu entier (`hashContent`) et non sur ses 100 premiers caractères.
 *
 * pdf.js (~400 Ko) est importé à la demande, au premier aperçu.
 */

type PdfJs = typeof import('pdfjs-dist')

let pdfjsPromise: Promise<PdfJs> | null = null

function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= import('pdfjs-dist').then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
    return pdfjs
  })
  return pdfjsPromise
}

/** Décode un base64 (avec ou sans préfixe `data:…;base64,`) en octets. */
export function base64ToBytes(base64: string): Uint8Array {
  const comma = base64.startsWith('data:') ? base64.indexOf(',') : -1
  const binary = atob(comma >= 0 ? base64.slice(comma + 1) : base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Hash rapide (cyrb53, 53 bits) d'une chaîne entière, préfixé par sa longueur : sert de clé de
 * cache. Synchrone et sans `crypto.subtle` (indisponible hors HTTPS, ex. serveur de dev en IP locale).
 */
export function hashContent(content: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0)
  return `${content.length}-${hash.toString(36)}`
}

type PdfSource = { data: Uint8Array } | { url: string }

async function renderFirstPage(source: PdfSource, width: number): Promise<string> {
  const pdfjs = await loadPdfJs()
  const pdf = await pdfjs.getDocument({ ...source, useSystemFonts: true, disableFontFace: false })
    .promise
  try {
    const page = await pdf.getPage(1)
    const scale = width / page.getViewport({ scale: 1 }).width
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Impossible de créer le contexte canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    await page.render({ canvasContext: context, viewport, background: 'white' }).promise
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    await pdf.destroy()
  }
}

/** Miniature (data-URL JPEG) de la page 1 d'un PDF fourni en base64, à la largeur voulue (px). */
export function generatePdfPreview(base64: string, width = 200): Promise<string> {
  return renderFirstPage({ data: base64ToBytes(base64) }, width)
}

/** Miniature (data-URL JPEG) de la page 1 d'un PDF accessible par URL, à la largeur voulue (px). */
export function generatePdfPreviewFromUrl(url: string, width = 200): Promise<string> {
  return renderFirstPage({ url }, width)
}

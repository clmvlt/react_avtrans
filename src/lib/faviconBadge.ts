import faviconAsset from '@/assets/favicon.png'

/**
 * Badge du nombre de notifications non lues dessiné sur le favicon (port de useFaviconBadge du
 * Vue). Module simple, pas un hook : l'état (canvas, image, URL d'origine) est global à la page.
 * Appelé par features/notifications/hooks/useNotificationSideEffects, monté une seule fois.
 */

const FAVICON_SIZE = 32
const BADGE_SIZE = 14
const BADGE_FONT_SIZE = 10

/** URL du favicon d'origine, pour le restaurer */
let originalFaviconUrl: string | null = null
let canvas: HTMLCanvasElement | null = null
/** Chargement unique de l'image (le Vue pouvait créer deux canvas sur deux appels concurrents) */
let imageLoading: Promise<HTMLImageElement> | null = null
/** Incrémenté à chaque effacement : un dessin lancé avant n'est plus appliqué ensuite */
let generation = 0

const findFaviconLink = () => document.querySelector<HTMLLinkElement>('link[rel="icon"]')

function loadFaviconImage(): Promise<HTMLImageElement> {
  if (!imageLoading) {
    imageLoading = new Promise<HTMLImageElement>((resolve, reject) => {
      // Le Vue retombait sur '/src/assets/favicon.png', valable en dev uniquement :
      // on utilise l'URL de l'asset importé, correcte aussi après le build.
      originalFaviconUrl = findFaviconLink()?.href ?? faviconAsset
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = () => {
        if (originalFaviconUrl !== faviconAsset) {
          originalFaviconUrl = faviconAsset
          image.src = faviconAsset
        } else {
          reject(new Error('Cannot load favicon image'))
        }
      }
      image.src = originalFaviconUrl
    }).catch((error: unknown) => {
      // Nouvel essai au prochain appel
      imageLoading = null
      throw error
    })
  }
  return imageLoading
}

/** Favicon d'origine + badge rouge (cercle, ou pilule pour « 99+ ») en haut à droite. */
function drawFavicon(image: HTMLImageElement, count: number): string {
  canvas ??= document.createElement('canvas')
  canvas.width = FAVICON_SIZE
  canvas.height = FAVICON_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Cannot get canvas context')

  ctx.clearRect(0, 0, FAVICON_SIZE, FAVICON_SIZE)
  ctx.drawImage(image, 0, 0, FAVICON_SIZE, FAVICON_SIZE)

  if (count > 0) {
    const displayCount = count > 99 ? '99+' : String(count)
    const isPill = displayCount.length > 2
    const badgeX = FAVICON_SIZE - BADGE_SIZE
    const badgeY = 0
    const badgeWidth = isPill ? BADGE_SIZE + 4 : BADGE_SIZE
    const badgeXAdjusted = FAVICON_SIZE - badgeWidth

    ctx.beginPath()
    if (isPill) {
      ctx.roundRect(badgeXAdjusted, badgeY, badgeWidth, BADGE_SIZE, BADGE_SIZE / 2)
    } else {
      ctx.arc(badgeX + BADGE_SIZE / 2, badgeY + BADGE_SIZE / 2, BADGE_SIZE / 2, 0, Math.PI * 2)
    }
    ctx.fillStyle = '#ef4444'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${BADGE_FONT_SIZE}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const textX = isPill ? badgeXAdjusted + badgeWidth / 2 : badgeX + BADGE_SIZE / 2
    ctx.fillText(displayCount, textX, badgeY + BADGE_SIZE / 2)
  }

  return canvas.toDataURL('image/png')
}

/** Affiche `count` sur le favicon (0 : favicon d'origine redessiné, sans badge). */
export async function setFaviconBadgeCount(count: number): Promise<void> {
  const requestedAt = generation
  try {
    const image = await loadFaviconImage()
    if (requestedAt !== generation) return
    const dataUrl = drawFavicon(image, count)

    let link = findFaviconLink()
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      document.head.appendChild(link)
    }
    link.href = dataUrl
  } catch (error) {
    console.error('[faviconBadge] Error updating favicon:', error)
  }
}

/** Remet le favicon d'origine (sortie de l'app authentifiée). */
export function clearFaviconBadge(): void {
  generation++
  if (!originalFaviconUrl) return
  const link = findFaviconLink()
  if (link) link.href = originalFaviconUrl
}

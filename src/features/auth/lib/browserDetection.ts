/**
 * Détection du navigateur et instructions d'ajout à l'écran d'accueil (useBrowserDetection du Vue).
 * Fonctions pures ; le champ `icon` du Vue (FontAwesome, jamais rendu) n'est pas repris.
 */

export type BrowserType =
  'chrome-android' | 'chrome-ios' | 'safari' | 'firefox' | 'edge' | 'samsung' | 'unknown'

const BROWSER_NAMES: Record<BrowserType, string> = {
  'chrome-android': 'Chrome (Android)',
  'chrome-ios': 'Chrome (iOS)',
  safari: 'Safari',
  firefox: 'Firefox',
  edge: 'Edge',
  samsung: 'Samsung Internet',
  unknown: 'Autre navigateur',
}

const BROWSER_INSTRUCTIONS: Record<BrowserType, string[]> = {
  'chrome-android': [
    'Appuyez sur les trois points verticaux (⋮) en haut à droite',
    'Sélectionnez "Ajouter à l\'écran d\'accueil"',
    'Confirmez en appuyant sur "Ajouter"',
    "Le raccourci apparaîtra sur votre écran d'accueil",
  ],
  safari: [
    'Appuyez sur le bouton "Partager" (icône carrée avec flèche ↑) en bas de l\'écran',
    'Faites défiler vers le bas et sélectionnez "Sur l\'écran d\'accueil"',
    'Modifiez le nom si souhaité et appuyez sur "Ajouter"',
    "Le raccourci apparaîtra sur votre écran d'accueil",
  ],
  'chrome-ios': [
    'Appuyez sur le bouton "Partager" (icône carrée avec flèche ↑)',
    'Faites défiler vers le bas et sélectionnez "Sur l\'écran d\'accueil"',
    'Modifiez le nom si souhaité et appuyez sur "Ajouter"',
    "Le raccourci apparaîtra sur votre écran d'accueil",
  ],
  firefox: [
    'Appuyez sur les trois points verticaux (⋮) en bas à droite',
    'Sélectionnez "Installer" ou "Ajouter à l\'écran d\'accueil"',
    "Confirmez l'installation",
    "Le raccourci apparaîtra sur votre écran d'accueil",
  ],
  edge: [
    "Appuyez sur les trois points horizontaux (⋯) en bas de l'écran",
    'Sélectionnez "Ajouter au téléphone"',
    'Choisissez "Ajouter à l\'écran d\'accueil"',
    "Le raccourci apparaîtra sur votre écran d'accueil",
  ],
  samsung: [
    'Appuyez sur les trois lignes horizontales (≡) en bas à droite',
    'Sélectionnez "Ajouter la page à" puis "Écran d\'accueil"',
    'Confirmez en appuyant sur "Ajouter"',
    "Le raccourci apparaîtra sur votre écran d'accueil",
  ],
  unknown: [
    'Ouvrez le menu de votre navigateur (généralement ⋮ ou ≡)',
    'Recherchez l\'option "Ajouter à l\'écran d\'accueil" ou "Installer"',
    "Suivez les instructions à l'écran",
    "Le raccourci apparaîtra sur votre écran d'accueil",
  ],
}

/** Type de navigateur d'après le User-Agent. */
export function detectBrowser(userAgent: string = navigator.userAgent): BrowserType {
  const ua = userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(ua)) {
    if (/crios/.test(ua)) return 'chrome-ios'
    // Firefox iOS (fxios) utilise WebKit : mêmes instructions que Safari
    return 'safari'
  }

  if (/android/.test(ua)) {
    if (/samsungbrowser/.test(ua)) return 'samsung'
    if (/edg/.test(ua)) return 'edge'
    if (/firefox/.test(ua)) return 'firefox'
    // Par défaut, beaucoup de navigateurs Android sont basés sur Chrome
    if (/chrome/.test(ua)) return 'chrome-android'
  }

  // Ordinateur ou autre
  if (/edg/.test(ua)) return 'edge'
  if (/firefox/.test(ua)) return 'firefox'
  // Bug B-33 du Vue reproduit (MIGRATION.md 8.2) : Chrome sur ordinateur reçoit les
  // instructions Android
  if (/chrome/.test(ua)) return 'chrome-android'
  if (/safari/.test(ua)) return 'safari'

  return 'unknown'
}

/** Étapes d'ajout à l'écran d'accueil pour un navigateur. */
export function getInstructions(browser: BrowserType): string[] {
  return BROWSER_INSTRUCTIONS[browser]
}

/** Nom lisible du navigateur. */
export function getBrowserName(browser: BrowserType): string {
  return BROWSER_NAMES[browser]
}

/** Tous les types de navigateurs, dans l'ordre d'affichage des onglets. */
export function getAllBrowserTypes(): BrowserType[] {
  return ['chrome-android', 'safari', 'chrome-ios', 'firefox', 'edge', 'samsung', 'unknown']
}

/** Téléphone ou tablette (même test que Login.vue pour le prompt d'écran d'accueil). */
export function isMobileDevice(userAgent: string = navigator.userAgent): boolean {
  return /android|iphone|ipad|ipod/i.test(userAgent)
}

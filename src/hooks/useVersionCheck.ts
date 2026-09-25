import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
import { APP_VERSION } from '@/config/version'

/**
 * Détection des mises à jour de l'application (port de useVersionCheck du Vue).
 *
 * Principe : le bundle en cours d'exécution connaît sa propre version (APP_VERSION, injectée
 * au build depuis package.json). On la compare à `/version.json`, écrit à chaque build et servi
 * sans cache. Si les deux diffèrent, le serveur a été redéployé depuis le chargement de la page.
 *
 * Déclencheurs : chargement initial, retour au premier plan (PWA en arrière-plan), focus de la
 * fenêtre, retour en ligne, restauration depuis le bfcache, navigation entre pages, et un
 * intervalle de secours. Les vérifications sont espacées d'au moins une minute.
 *
 * Comportement :
 *  - au chargement initial : rechargement silencieux, une seule fois par version serveur
 *    (si le navigateur ressert un index.html périmé, on affiche le bandeau au lieu de boucler) ;
 *  - ensuite : bandeau « nouvelle version », que l'utilisateur applique ou ignore pour la session.
 *
 * État de module + useSyncExternalStore (pas de second store Zustand).
 */

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const MIN_DELAY_BETWEEN_CHECKS_MS = 60 * 1000
const RELOADED_FOR_KEY = 'version_check_reloaded_for'
const DISMISSED_KEY = 'version_check_dismissed'
/** Clés de l'ancienne implémentation (comparaison via localStorage), nettoyées au démarrage */
const LEGACY_LOCAL_KEYS = ['app_version']
const LEGACY_SESSION_KEYS = ['dismissed_update_version']

type CheckOptions = {
  /** Vérification au chargement de la page : rechargement silencieux si périmé */
  initial?: boolean
  /** Ignore l'espacement minimal entre deux vérifications */
  force?: boolean
}

type VersionCheckState = {
  newVersionAvailable: boolean
  newVersion: string | null
}

let state: VersionCheckState = { newVersionAvailable: false, newVersion: null }
const listeners = new Set<() => void>()

function setState(next: Partial<VersionCheckState>): void {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state

let started = false
let lastCheckAt = 0
let inFlight: Promise<void> | null = null
let stop: (() => void) | null = null

// sessionStorage peut être indisponible (navigation privée, quotas) : on ne bloque jamais dessus
const sessionGet = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}
const sessionSet = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    /* stockage indisponible */
  }
}
const sessionRemove = (key: string): void => {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* stockage indisponible */
  }
}

/** Version actuellement servie par le serveur, ou null si injoignable / illisible. */
async function fetchServerVersion(): Promise<string | null> {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null
    // Si le fichier manque, le fallback SPA renvoie index.html : on l'ignore
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('json')) return null
    const data: unknown = await response.json()
    const version = (data as { version?: unknown } | null)?.version
    return typeof version === 'string' && version.length > 0 ? version : null
  } catch {
    return null
  }
}

/** Recharge l'application (après avoir vidé la Cache API si un jour un service worker l'utilise). */
async function reloadApp(): Promise<void> {
  if ('caches' in window) {
    try {
      const names = await caches.keys()
      await Promise.all(names.map((name) => caches.delete(name)))
    } catch {
      /* rien à vider */
    }
  }
  window.location.reload()
}

/** Compare la version du bundle exécuté à celle servie par le serveur. */
function checkVersion(options: CheckOptions = {}): Promise<void> {
  if (inFlight) return inFlight
  const now = Date.now()
  if (!options.force && now - lastCheckAt < MIN_DELAY_BETWEEN_CHECKS_MS) return Promise.resolve()
  lastCheckAt = now

  inFlight = (async () => {
    const serverVersion = await fetchServerVersion()
    if (!serverVersion) return // hors ligne ou fichier illisible : on réessaiera

    if (serverVersion === APP_VERSION) {
      setState({ newVersionAvailable: false, newVersion: null })
      return
    }

    if (options.initial && sessionGet(RELOADED_FOR_KEY) !== serverVersion) {
      // Premier constat pour cette version : on recharge sans déranger l'utilisateur
      sessionSet(RELOADED_FOR_KEY, serverVersion)
      console.info(`[VersionCheck] ${APP_VERSION} → ${serverVersion} : rechargement`)
      await reloadApp()
      return
    }

    if (sessionGet(DISMISSED_KEY) === serverVersion) return
    setState({ newVersion: serverVersion, newVersionAvailable: true })
  })().finally(() => {
    inFlight = null
  })

  return inFlight
}

/** Applique la mise à jour (bouton du bandeau). */
async function performUpdate(): Promise<void> {
  sessionRemove(DISMISSED_KEY)
  // Si après ce rechargement le bundle est toujours périmé (index.html en cache navigateur),
  // le bandeau sera ré-affiché plutôt que de recharger en boucle
  if (state.newVersion) sessionSet(RELOADED_FOR_KEY, state.newVersion)
  await reloadApp()
}

/** Ignore cette version pour la session en cours. */
function dismissUpdate(): void {
  if (state.newVersion) sessionSet(DISMISSED_KEY, state.newVersion)
  setState({ newVersionAvailable: false })
}

function start(): void {
  if (started) return
  started = true

  for (const key of LEGACY_LOCAL_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* stockage indisponible */
    }
  }
  for (const key of LEGACY_SESSION_KEYS) sessionRemove(key)

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void checkVersion()
  }
  const onFocus = () => void checkVersion()
  const onOnline = () => void checkVersion({ force: true })
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) void checkVersion({ force: true })
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('focus', onFocus)
  window.addEventListener('online', onOnline)
  window.addEventListener('pageshow', onPageShow)
  const intervalId = window.setInterval(() => void checkVersion(), CHECK_INTERVAL_MS)

  stop = () => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('focus', onFocus)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('pageshow', onPageShow)
    window.clearInterval(intervalId)
    stop = null
    started = false
  }

  void checkVersion({ initial: true, force: true })
}

/**
 * Détection des mises à jour : à utiliser une seule fois (UpdateBanner, monté par RootLayout,
 * donc sous le routeur). Active uniquement sur un build de production (version.json n'existe
 * pas en dev).
 */
export function useVersionCheck() {
  const { newVersionAvailable, newVersion } = useSyncExternalStore(subscribe, getSnapshot)
  const location = useLocation()

  useEffect(() => {
    if (!import.meta.env.PROD) return
    start()
    return () => stop?.()
  }, [])

  // Vérification après chaque navigation (router.afterEach du Vue). Au montage, la vérification
  // initiale est déjà en cours : cet appel est dédoublonné par `inFlight`.
  useEffect(() => {
    if (started) void checkVersion()
  }, [location.key])

  return {
    appVersion: APP_VERSION,
    newVersionAvailable,
    newVersion,
    checkForUpdate: () => checkVersion({ force: true }),
    performUpdate,
    dismissUpdate,
  }
}

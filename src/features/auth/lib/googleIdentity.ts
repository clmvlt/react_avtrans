import type { GoogleAccountsId } from '@/types/google-identity'

/**
 * Chargement dynamique du script Google Identity Services (GIS), repris de useGoogleIdentity du Vue.
 *
 * Le script n'est chargé qu'une seule fois (promesse mémoïsée au niveau du module), au moment où
 * un composant en a besoin, plutôt que d'alourdir index.html pour toutes les pages.
 */

const GIS_SRC = 'https://accounts.google.com/gsi/client'

let loaderPromise: Promise<GoogleAccountsId> | null = null

/**
 * Charge GIS et résout avec `google.accounts.id` une fois prêt.
 * Rejette si le script ne peut pas être chargé (réseau, bloqueur, etc.).
 */
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  // Déjà disponible
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id)
  }

  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const finish = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id)
      } else {
        loaderPromise = null
        reject(new Error('Google Identity Services indisponible après chargement du script'))
      }
    }

    // Script déjà présent dans le DOM (ex. ajouté par une autre instance)
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        finish()
      } else {
        existing.addEventListener('load', finish, { once: true })
        existing.addEventListener(
          'error',
          () => {
            loaderPromise = null
            reject(new Error('Échec du chargement de Google Identity Services'))
          },
          { once: true },
        )
      }
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true'
        finish()
      },
      { once: true },
    )
    script.addEventListener(
      'error',
      () => {
        loaderPromise = null
        script.remove()
        reject(new Error('Échec du chargement de Google Identity Services'))
      },
      { once: true },
    )

    document.head.appendChild(script)
  })

  return loaderPromise
}

/** Client ID Google exposé côté frontend (public), lu comme dans le Vue. */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

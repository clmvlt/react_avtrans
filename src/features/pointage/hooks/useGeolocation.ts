import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { GpsLocationRequest } from '@/services'

export type LocationPermission = 'granted' | 'prompt' | 'denied' | 'unsupported'

/** Toutes les notifications de géolocalisation partagent cet id : une nouvelle erreur remplace la précédente. */
const GEO_MESSAGE_ID = 'pointage-geolocation'

/** L'API accepte des coordonnées null : on n'envoie pas de fausse position (0,0). */
const NO_LOCATION: GpsLocationRequest = { latitude: null, longitude: null }

function getLocationDeniedMessage(): string {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) {
    return "Localisation refusée. Appuyez sur le cadenas (🔒) dans la barre d'adresse → Autorisations → Localisation → Autoriser."
  }
  if (/iPad|iPhone|iPod/.test(ua)) {
    return 'Localisation refusée. Allez dans Réglages → Safari → Service de localisation → Autoriser.'
  }
  return "Localisation refusée. Cliquez sur l'icône à gauche de la barre d'adresse → Autoriser la localisation."
}

type GeoErrorOptions = {
  title?: string
  duration?: number
  retryLabel?: string
  onRetry?: () => void
}

/** `showMessage({ id, title, text, variant: 'danger', duration, action })` du Vue → sonner. */
function showGeoError(
  text: string,
  { title, duration = 7000, retryLabel, onRetry }: GeoErrorOptions = {},
) {
  toast.error(title ?? text, {
    id: GEO_MESSAGE_ID,
    description: title ? text : undefined,
    duration,
    action: retryLabel && onRetry ? { label: retryLabel, onClick: onRetry } : undefined,
  })
}

type RequestLocationOptions = {
  /** Pas de notification en cas d'échec (chargement de la page : la puce « Localisation refusée » suffit). */
  silent?: boolean
}

/**
 * Géolocalisation du pointage (Pointage.vue) : état de la permission (suivi via l'API Permissions,
 * écouteur retiré au démontage), demande silencieuse au chargement si la permission est à
 * « prompt », et `requestLocation()` qui mutualise les demandes rapprochées et renvoie toujours une
 * position, éventuellement `{ latitude: null, longitude: null }`.
 */
export function useGeolocation() {
  const [permission, setPermission] = useState<LocationPermission>(() =>
    navigator.geolocation ? 'prompt' : 'unsupported',
  )
  // Une seule demande de position à la fois : les appels rapprochés partagent la même promesse
  const pendingLocation = useRef<Promise<GpsLocationRequest> | null>(null)

  function requestLocation({
    silent = false,
  }: RequestLocationOptions = {}): Promise<GpsLocationRequest> {
    if (!navigator.geolocation) {
      setPermission('unsupported')
      if (!silent) showGeoError("La géolocalisation n'est pas disponible sur cet appareil")
      return Promise.resolve(NO_LOCATION)
    }

    if (pendingLocation.current) return pendingLocation.current

    const retry = () => void requestLocation()
    const promise = new Promise<GpsLocationRequest>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermission('granted')
          toast.dismiss(GEO_MESSAGE_ID)
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermission('denied')
            if (!silent) {
              showGeoError(getLocationDeniedMessage(), {
                title: 'Localisation bloquée',
                duration: 12000,
                retryLabel: 'Réessayer la localisation',
                onRetry: retry,
              })
            }
          } else if (error.code === error.TIMEOUT) {
            if (!silent) {
              showGeoError("Impossible d'obtenir la position (délai dépassé)", {
                retryLabel: 'Réessayer',
                onRetry: retry,
              })
            }
          } else if (!silent) {
            showGeoError('Erreur de géolocalisation')
          }
          resolve(NO_LOCATION)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      )
    }).finally(() => {
      pendingLocation.current = null
    })

    pendingLocation.current = promise
    return promise
  }

  const requestSilently = useEffectEvent(() => {
    void requestLocation({ silent: true })
  })

  // Permission au chargement, puis demande immédiate (sans notification) si elle est à « prompt »
  useEffect(() => {
    if (!navigator.geolocation) return
    let cancelled = false
    let status: PermissionStatus | null = null
    const syncPermission = () => {
      if (status) setPermission(status.state)
    }

    const init = async () => {
      let state: LocationPermission = 'prompt'
      if (navigator.permissions) {
        try {
          status = await navigator.permissions.query({ name: 'geolocation' })
          if (cancelled) return
          state = status.state
          setPermission(state)
          status.addEventListener('change', syncPermission)
        } catch {
          // API Permissions non supportée : on reste sur « prompt »
        }
      }
      if (!cancelled && state === 'prompt') requestSilently()
    }
    void init()

    return () => {
      cancelled = true
      status?.removeEventListener('change', syncPermission)
    }
  }, [])

  return { permission, requestLocation }
}

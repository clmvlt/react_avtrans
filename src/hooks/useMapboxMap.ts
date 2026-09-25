import { useEffect, useState } from 'react'
import { MAPBOX_TOKEN } from '@/config/map'

/** Couleurs des marqueurs du Vue (useMapModal) : vert = début, violet AVTRANS = fin. */
export const MAP_MARKER_COLORS = { start: '#16a34a', end: '#581c87' } as const

/** Style de carte utilisé par le Vue (useMapModal, codé en dur). */
export const MAP_DEFAULT_STYLE = 'mapbox://styles/mapbox/streets-v12'

/** Un point affiché sur la carte, avec sa popup optionnelle (titre en gras + une ligne). */
export type MapMarker = {
  lng: number
  lat: number
  /** Couleur du marqueur (vert `MAP_MARKER_COLORS.start` par défaut). */
  color?: string
  popupTitle?: string
  popupText?: string
}

export type UseMapboxMapOptions = {
  /** Points à afficher ; la carte est centrée sur le premier, puis ajustée s'il y en a plusieurs. */
  markers: MapMarker[]
  /** Style Mapbox (`streets-v12` par défaut, comme le Vue). */
  mapStyle?: string
  /** Zoom initial (14 par défaut). */
  zoom?: number
  /** Marge de `fitBounds` en px (80 par défaut). */
  fitPadding?: number
  /** Zoom maximal de `fitBounds` (16 par défaut). */
  fitMaxZoom?: number
}

type MapboxGl = (typeof import('mapbox-gl'))['default']

let mapboxPromise: Promise<MapboxGl> | null = null

/** Charge mapbox-gl (~1,7 Mo) et sa feuille de style à la demande, une seule fois. */
function loadMapbox(): Promise<MapboxGl> {
  mapboxPromise ??= Promise.all([import('mapbox-gl'), import('mapbox-gl/dist/mapbox-gl.css')])
    .then(([mod]) => mod.default)
    .catch((error: unknown) => {
      mapboxPromise = null
      throw error
    })
  return mapboxPromise
}

/** Contenu de popup construit en DOM (pas de `setHTML`), texte sombre sur le fond blanc de Mapbox. */
function popupContent(title?: string, text?: string): HTMLElement {
  const root = document.createElement('div')
  root.className = 'text-neutral-900'
  if (title) {
    const strong = document.createElement('strong')
    strong.textContent = title
    root.appendChild(strong)
  }
  if (title && text) root.appendChild(document.createElement('br'))
  if (text) root.appendChild(document.createTextNode(text))
  return root
}

/**
 * Carte Mapbox (port de la partie carte de `useMapModal` du Vue) : import dynamique de mapbox-gl
 * et de son CSS, contrôles de navigation, marqueurs avec popups, `fitBounds` quand il y a au moins
 * deux points. La carte est détruite (`map.remove()`) au démontage ou quand les points changent,
 * et redimensionnée quand son conteneur change de taille (ouverture animée d'un Dialog).
 *
 * @example
 * const { containerRef, status } = useMapboxMap({ markers })
 * <div ref={containerRef} className="h-[350px] w-full" />
 */
export function useMapboxMap({
  markers,
  mapStyle = MAP_DEFAULT_STYLE,
  zoom = 14,
  fitPadding = 80,
  fitMaxZoom = 16,
}: UseMapboxMapOptions) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [result, setResult] = useState<{ key: string; status: 'ready' | 'error' } | null>(null)

  // Clé stable : la carte n'est recréée que si les points ou les réglages changent réellement.
  const configKey = JSON.stringify({ markers, mapStyle, zoom, fitPadding, fitMaxZoom })

  useEffect(() => {
    if (!container) return
    const config = JSON.parse(configKey) as Required<UseMapboxMapOptions>
    const first = config.markers[0]
    if (!first) return

    let cancelled = false
    let map: InstanceType<MapboxGl['Map']> | null = null
    let observer: ResizeObserver | null = null

    loadMapbox()
      .then((mapboxgl) => {
        if (cancelled) return
        mapboxgl.accessToken = MAPBOX_TOKEN
        const instance = new mapboxgl.Map({
          container,
          style: config.mapStyle,
          center: [first.lng, first.lat],
          zoom: config.zoom,
        })
        map = instance
        instance.addControl(new mapboxgl.NavigationControl(), 'top-right')

        instance.on('load', () => {
          for (const marker of config.markers) {
            const mapMarker = new mapboxgl.Marker({
              color: marker.color ?? MAP_MARKER_COLORS.start,
            }).setLngLat([marker.lng, marker.lat])
            if (marker.popupTitle || marker.popupText) {
              mapMarker.setPopup(
                new mapboxgl.Popup().setDOMContent(
                  popupContent(marker.popupTitle, marker.popupText),
                ),
              )
            }
            mapMarker.addTo(instance)
          }
          if (config.markers.length >= 2) {
            const bounds = new mapboxgl.LngLatBounds()
            for (const marker of config.markers) bounds.extend([marker.lng, marker.lat])
            instance.fitBounds(bounds, { padding: config.fitPadding, maxZoom: config.fitMaxZoom })
          }
          instance.resize()
          setResult({ key: configKey, status: 'ready' })
        })

        observer = new ResizeObserver(() => instance.resize())
        observer.observe(container)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        console.error('Chargement de la carte impossible :', error)
        setResult({ key: configKey, status: 'error' })
      })

    return () => {
      cancelled = true
      observer?.disconnect()
      map?.remove()
    }
  }, [container, configKey])

  const status: 'loading' | 'ready' | 'error' =
    result?.key === configKey ? result.status : markers.length > 0 ? 'loading' : 'ready'

  /** Ref callback à poser sur le `<div>` qui reçoit la carte (dimensions explicites requises). */
  return { containerRef: setContainer, status }
}

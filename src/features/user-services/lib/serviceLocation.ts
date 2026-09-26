import { MAP_MARKER_COLORS, type MapMarker } from '@/hooks/useMapboxMap'
import type { ServiceDTO } from '@/models'
import { formatTime } from '@/utils/timeFormatters'

/** Texte affiché à la place de coordonnées 0,0 (échec de géolocalisation). */
export const POSITION_UNAVAILABLE = 'Position non disponible'

const hasStartData = (service: ServiceDTO) => service.latitude != null && service.longitude != null

const hasEndData = (service: ServiceDTO) =>
  service.latitudeEnd != null && service.longitudeEnd != null

/** Au moins une position enregistrée, même 0,0 : le bouton « Localisation » s'affiche. */
export function hasLocationData(service: ServiceDTO): boolean {
  return hasStartData(service) || hasEndData(service)
}

/** Une position enregistrée vaut 0 (échec de géolocalisation) : bouton en rouge. */
export function isLocationInvalid(service: ServiceDTO): boolean {
  const startInvalid = hasStartData(service) && (service.latitude === 0 || service.longitude === 0)
  const endInvalid =
    hasEndData(service) && (service.latitudeEnd === 0 || service.longitudeEnd === 0)
  return startInvalid || endInvalid
}

/** Contenu du dialog « Localisation » d'un pointage. */
export type ServiceLocationDetails = {
  /** « 08:02 → 17:30 » */
  time: string
  /** Coordonnées de début, « Position non disponible », ou vide si aucune */
  startCoords: string
  endCoords: string
  markers: MapMarker[]
}

/**
 * Détails de localisation (showLocationMap de useMapModal.ts). `null` si aucune position n'est
 * valide : bug B-26 reproduit, le bouton rouge d'un pointage à 0,0 ne fait alors rien.
 */
export function getServiceLocation(service: ServiceDTO): ServiceLocationDetails | null {
  const { latitude, longitude, latitudeEnd, longitudeEnd } = service
  const validStart = !!(latitude && longitude)
  const validEnd = !!(latitudeEnd && longitudeEnd)
  if (!validStart && !validEnd) return null

  const kind = service.isBreak ? 'pause' : 'service'
  const debut = service.debut ? String(service.debut) : null
  const fin = service.fin ? String(service.fin) : null
  const markers: MapMarker[] = []
  if (validStart && latitude && longitude) {
    markers.push({
      lng: longitude,
      lat: latitude,
      color: MAP_MARKER_COLORS.start,
      popupTitle: `Début ${kind}`,
      popupText: formatTime(debut),
    })
  }
  if (validEnd && latitudeEnd && longitudeEnd) {
    markers.push({
      lng: longitudeEnd,
      lat: latitudeEnd,
      color: MAP_MARKER_COLORS.end,
      popupTitle: `Fin ${kind}`,
      popupText: formatTime(fin),
    })
  }

  return {
    time: `${formatTime(debut)} → ${formatTime(fin)}`,
    startCoords:
      validStart && latitude && longitude
        ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        : hasStartData(service)
          ? POSITION_UNAVAILABLE
          : '',
    endCoords:
      validEnd && latitudeEnd && longitudeEnd
        ? `${latitudeEnd.toFixed(6)}, ${longitudeEnd.toFixed(6)}`
        : hasEndData(service)
          ? POSITION_UNAVAILABLE
          : '',
    markers,
  }
}

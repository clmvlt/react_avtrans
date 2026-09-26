import { addDaysToKey } from '@/lib/dates'
import type { ServiceDTO } from '@/models'
import { getCurrentTime, getTodayDate, toLocalDateTimeString } from '@/utils/timeFormatters'
import type { ServiceFormValues } from '../schemas/serviceForm'

/** Coordonnées du pointage modifié, renvoyées telles quelles (le formulaire ne les montre pas). */
export type ServiceCoordinates = {
  latitude: number | null
  longitude: number | null
  latitudeEnd: number | null
  longitudeEnd: number | null
}

export const NO_COORDINATES: ServiceCoordinates = {
  latitude: null,
  longitude: null,
  latitudeEnd: null,
  longitudeEnd: null,
}

/** Ce qu'édite le dialog d'un pointage, figé à l'ouverture (« maintenant » calculé au clic). */
export type ServiceFormTarget = {
  /** Pointage modifié ; `null` = création */
  service: ServiceDTO | null
  values: ServiceFormValues
  coordinates: ServiceCoordinates
}

/** Corps envoyé à POST /services/admin/create et PUT /services/admin/{uuid}. */
export type AdminServicePayload = {
  debut: string
  fin?: string
  latitude?: number
  longitude?: number
  latitudeEnd?: number
  longitudeEnd?: number
  isBreak: boolean
}

/**
 * Valeurs d'un nouveau pointage : début et fin à maintenant, le jour donné ou aujourd'hui.
 * « Aujourd'hui » vient de `getTodayDate()` (UTC) : bug B-01 reproduit, entre 0 h et 1-2 h
 * (heure de Paris) la date proposée est la veille.
 */
export function createServiceFormValues(date?: string): ServiceFormValues {
  const day = date ?? getTodayDate()
  const now = getCurrentTime()
  return {
    isBreak: false,
    debutDate: day,
    debutTime: now,
    hasEnd: true,
    finDate: day,
    finTime: now,
  }
}

/** Valeurs d'un pointage existant (dates en heure locale). */
export function editServiceFormValues(service: ServiceDTO): ServiceFormValues {
  const debut = toLocalDateTimeString(service.debut ? String(service.debut) : null)
  const fin = service.fin ? toLocalDateTimeString(String(service.fin)) : ''
  return {
    isBreak: !!service.isBreak,
    debutDate: debut.split('T')[0] || '',
    debutTime: debut.split('T')[1] || '',
    hasEnd: !!service.fin,
    finDate: fin ? fin.split('T')[0] || '' : '',
    finTime: fin ? fin.split('T')[1] || '' : '',
  }
}

/** Coordonnées d'un pointage existant (`null` si absentes). */
export function serviceCoordinates(service: ServiceDTO): ServiceCoordinates {
  return {
    latitude: service.latitude ?? null,
    longitude: service.longitude ?? null,
    latitudeEnd: service.latitudeEnd ?? null,
    longitudeEnd: service.longitudeEnd ?? null,
  }
}

/**
 * Corps de la requête, comme useUserServices.ts : dates en heure locale naïve (`…T08:00:00`) ;
 * sans fin (« en cours ») la fin est omise, et l'API garde l'ancienne (impossible de rouvrir un
 * pointage, MIGRATION.md 8.3) ; une coordonnée à 0 est omise aussi.
 */
export function toServicePayload(
  values: ServiceFormValues,
  coordinates: ServiceCoordinates,
): AdminServicePayload {
  const finDate = values.hasEnd ? values.finDate : ''
  const finTime = values.hasEnd ? values.finTime : ''
  return {
    debut: `${values.debutDate}T${values.debutTime}:00`,
    fin: finDate && finTime ? `${finDate}T${finTime}:00` : undefined,
    latitude: coordinates.latitude || undefined,
    longitude: coordinates.longitude || undefined,
    latitudeEnd: coordinates.latitudeEnd || undefined,
    longitudeEnd: coordinates.longitudeEnd || undefined,
    isBreak: values.isBreak,
  }
}

type DurationFields = Pick<
  ServiceFormValues,
  'hasEnd' | 'debutDate' | 'debutTime' | 'finDate' | 'finTime'
>

/** Durée en minutes entre début et fin, `null` si incomplète ou sans fin. */
export function getDurationMinutes(values: DurationFields): number | null {
  const { hasEnd, debutDate, debutTime, finDate, finTime } = values
  if (!hasEnd || !debutDate || !debutTime || !finDate || !finTime) return null
  const start = new Date(`${debutDate}T${debutTime}`)
  const end = new Date(`${finDate}T${finTime}`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  return Math.round((end.getTime() - start.getTime()) / 60000)
}

/** « 8h 30min » ou « 8h » ; vide si la durée est inconnue ou négative. */
export function formatDurationLabel(minutes: number | null): string {
  if (minutes === null || minutes < 0) return ''
  const h = Math.floor(minutes / 60)
  const min = minutes % 60
  return min > 0 ? `${h}h ${String(min).padStart(2, '0')}min` : `${h}h`
}

/** Date de fin avancée d'un jour (service de nuit), à partir de la fin ou, à défaut, du début. */
export function nextDayKey(
  values: Pick<ServiceFormValues, 'finDate' | 'debutDate'>,
): string | null {
  const base = values.finDate || values.debutDate
  return base ? addDaysToKey(base, 1) : null
}

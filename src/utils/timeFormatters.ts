/**
 * Utilitaires de formatage pour les dates, heures et durées
 */

/**
 * Formate une date en heure locale (HH:MM)
 */
export const formatTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formate un nombre d'heures décimal de manière intelligente :
 * - < 1 minute : "30 s"
 * - < 1 heure : "25 min 30 s" ou "25 min"
 * - >= 1 heure : "1h 5m" ou "2h"
 */
export const formatHoursMinutes = (totalHours: number | null | undefined): string => {
  if (totalHours === null || totalHours === undefined || totalHours === 0) {
    return '0 s'
  }

  // Convertir en secondes totales pour un calcul précis
  const totalSeconds = Math.round(totalHours * 3600)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60

  // Moins d'une minute : afficher en secondes
  if (hours === 0 && minutes === 0) {
    return `${secs} s`
  }

  // Moins d'une heure : afficher minutes et secondes
  if (hours === 0) {
    return secs > 0 ? `${minutes} min ${secs} s` : `${minutes} min`
  }

  // Une heure ou plus : afficher heures et minutes
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

/**
 * Formate une date et heure complète
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formate une durée en secondes de manière intelligente :
 * - < 1 minute : "30 s"
 * - < 1 heure : "25 min 30 s" ou "25 min"
 * - >= 1 heure : "1h 5m" ou "2h"
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 0) seconds = 0

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  // Moins d'une minute : afficher en secondes
  if (hours === 0 && minutes === 0) {
    return `${secs} s`
  }

  // Moins d'une heure : afficher minutes et secondes
  if (hours === 0) {
    return secs > 0 ? `${minutes} min ${secs} s` : `${minutes} min`
  }

  // Une heure ou plus : afficher heures et minutes
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

/**
 * Calcule la durée entre une date de début et maintenant
 * Utilise le même format intelligent que les autres fonctions
 */
export const calculateDuration = (startDate: string | null | undefined): string => {
  if (!startDate) return '-'
  const start = new Date(startDate)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const totalSeconds = Math.floor(diffMs / 1000)

  return formatDuration(totalSeconds)
}

/**
 * Convertit une date UTC en chaîne de date/heure locale
 */
export const toLocalDateTimeString = (utcDateString: string | null | undefined): string => {
  if (!utcDateString) return ''

  const date = new Date(utcDateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Convertit une date/heure locale en chaîne ISO avec timezone
 */
export const toISOStringWithTimezone = (localDateTimeString: string): string => {
  if (!localDateTimeString) return ''
  const date = new Date(localDateTimeString)
  return date.toISOString()
}

/**
 * Obtient la date du jour au format YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  const now = new Date()
  return now.toISOString().split('T')[0] || ''
}

/**
 * Obtient l'heure actuelle au format HH:MM
 */
export const getCurrentTime = (): string => {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

/**
 * Obtient le nom du mois en français
 */
export const getMonthName = (month: number): string => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  const monthName = months[month - 1]
  return monthName || ''
}

/**
 * Formate des heures en format lisible
 */
export const formatHours = (hours: number | null | undefined): string => {
  if (hours === null || hours === undefined) return '-'
  return formatHoursMinutes(hours)
}

// ---------------------------------------------------------------------------
// Fuseau Europe/Paris
// Les journaux de modification s'affichent toujours en heure de Paris, quel
// que soit le fuseau du navigateur.
// ---------------------------------------------------------------------------

export const PARIS_TIME_ZONE = 'Europe/Paris'

const parisPartsFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: PARIS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
})

const parisLongDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: PARIS_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

interface ParisDateParts {
  year: string
  month: string
  day: string
  hour: string
  minute: string
}

const parseDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const getParisParts = (value: Date | string | null | undefined): ParisDateParts | null => {
  const date = parseDate(value)
  if (!date) return null
  const parts: Record<string, string> = {}
  for (const part of parisPartsFormatter.formatToParts(date)) {
    parts[part.type] = part.value
  }
  return {
    year: parts.year ?? '',
    month: parts.month ?? '',
    day: parts.day ?? '',
    hour: parts.hour ?? '',
    minute: parts.minute ?? ''
  }
}

/**
 * Clé de jour 'yyyy-MM-dd' à Paris ('' si date absente ou invalide)
 */
export const parisDayKey = (value: Date | string | null | undefined): string => {
  const p = getParisParts(value)
  return p ? `${p.year}-${p.month}-${p.day}` : ''
}

/**
 * Date à Paris : dd/MM/yyyy
 */
export const formatParisDate = (value: Date | string | null | undefined): string => {
  const p = getParisParts(value)
  return p ? `${p.day}/${p.month}/${p.year}` : ''
}

/**
 * Heure à Paris : HH:mm
 */
export const formatParisTime = (value: Date | string | null | undefined): string => {
  const p = getParisParts(value)
  return p ? `${p.hour}:${p.minute}` : ''
}

/**
 * Date et heure à Paris : "dd/MM/yyyy à HH:mm"
 */
export const formatParisDateTime = (value: Date | string | null | undefined): string => {
  const p = getParisParts(value)
  return p ? `${p.day}/${p.month}/${p.year} à ${p.hour}:${p.minute}` : ''
}

/**
 * Date longue à Paris : "samedi 12 septembre 2026"
 */
export const formatParisLongDate = (value: Date | string | null | undefined): string => {
  const date = parseDate(value)
  return date ? parisLongDateFormatter.format(date) : ''
}

/**
 * Compare deux instants à la minute près (l'affichage étant en HH:mm).
 * Deux valeurs absentes sont égales ; une seule absente ne l'est pas.
 */
export const isSameMinute = (
  a: Date | string | null | undefined,
  b: Date | string | null | undefined
): boolean => {
  const dateA = parseDate(a)
  const dateB = parseDate(b)
  if (!dateA || !dateB) return !dateA && !dateB
  return Math.floor(dateA.getTime() / 60000) === Math.floor(dateB.getTime() / 60000)
}

import { parseLocalDateKey, toLocalDateKey } from '@/lib/dates'
import { liveLineSeconds } from '@/lib/liveCounter'
import { groupLinesByServiceDay, sumWorkSeconds } from '@/lib/serviceLines'
import type { ServiceDTO } from '@/models'

/** Pointage d'une journée, avec ses badges de décalage de jour et sa durée affichée. */
export type ServiceDayItem = ServiceDTO & {
  /** « 10 juin » si le pointage commence un autre jour que l'en-tête */
  startDayLabel: string
  startDayTooltip: string
  /** « 10 juin » si le pointage franchit minuit */
  endDayLabel: string
  endDayTooltip: string
  /** Temps net d'un service (`dureeTravail`), durée d'une pause, en direct si en cours (s) */
  durationSeconds: number
}

export type ServiceDay = {
  /** Clé `YYYY-MM-DD` (date locale) */
  date: string
  /** « lundi » */
  dayName: string
  /** « 25 septembre 2026 » */
  dateFormatted: string
  /** Services et pauses mêlés, dans l'ordre chronologique */
  allServices: ServiceDayItem[]
  /** La journée contient au moins un service de travail (sinon, pas de total) */
  hasWork: boolean
  /** « 7h 30min » : somme des temps nets des services */
  totalHours: string
  totalSeconds: number
}

const time = (value: ServiceDTO['debut']) => new Date(value ?? '').getTime()

/** « 10 juin » : signale un pointage qui franchit minuit. */
const formatShortDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

/** Infobulle du décalage : « Le lendemain · mardi 10 juin 2026 ». */
function relativeDayTooltip(target: Date, reference: Date): string {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime()
  const r = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate()).getTime()
  const diff = Math.round((t - r) / 86_400_000)
  const full = target.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  let prefix = ''
  if (diff === 1) prefix = 'Le lendemain'
  else if (diff === 2) prefix = 'Le surlendemain'
  else if (diff > 0) prefix = `J+${diff}`
  return prefix ? `${prefix} · ${full}` : full
}

/**
 * Regroupe une page de pointages par journée (servicesByDay de useUserServices.ts), D12 :
 * - un service compte sur son jour de début, même s'il finit le lendemain ; ses pauses le suivent
 *   (`serviceParentUuid`), y compris après minuit (badges de décalage de jour) ;
 * - chaque journée est triée chronologiquement, les journées de la plus récente à la plus ancienne ;
 * - total = somme des temps nets (`dureeTravail`) des services, pauses déjà déduites par l'API ;
 *   `elapsed` fait avancer un pointage en cours.
 * Le calcul porte sur la page affichée (20 pointages) : une journée dont les services sont répartis
 * sur deux pages n'a ici que le total de ceux de la page (B-26).
 */
export function groupServicesByDay(services: ServiceDTO[], elapsed = 0): ServiceDay[] {
  return [...groupLinesByServiceDay(services).entries()]
    .map(([dateKey, dayServices]): ServiceDay => {
      const date = parseLocalDateKey(dateKey) ?? new Date(dateKey)

      const allServices = [...dayServices]
        .sort((a, b) => time(a.debut) - time(b.debut))
        .map((s): ServiceDayItem => {
          const debutDate = new Date(s.debut ?? '')
          const finDate = s.fin ? new Date(s.fin) : null
          const debutKey = toLocalDateKey(debutDate)
          const startsOtherDay = debutKey !== dateKey
          const endsOtherDay = !!finDate && toLocalDateKey(finDate) !== debutKey
          return {
            ...s,
            startDayLabel: startsOtherDay ? formatShortDate(debutDate) : '',
            startDayTooltip: startsOtherDay ? relativeDayTooltip(debutDate, date) : '',
            endDayLabel: finDate && endsOtherDay ? formatShortDate(finDate) : '',
            endDayTooltip: finDate && endsOtherDay ? relativeDayTooltip(finDate, debutDate) : '',
            durationSeconds: liveLineSeconds(s, elapsed),
          }
        })

      const totalSeconds = sumWorkSeconds(dayServices, elapsed)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)

      return {
        date: dateKey,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        dateFormatted: date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        allServices,
        hasWork: dayServices.some((s) => !s.isBreak),
        totalHours: minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`,
        totalSeconds,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

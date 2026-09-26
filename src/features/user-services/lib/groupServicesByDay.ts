import { toLocalDateKey } from '@/lib/dates'
import type { ServiceDTO } from '@/models'

/** Pointage d'une journée, avec ses badges de décalage de jour. */
export type ServiceDayItem = ServiceDTO & {
  /** « 10 juin » si le pointage commence un autre jour que l'en-tête */
  startDayLabel: string
  startDayTooltip: string
  /** « 10 juin » si le pointage franchit minuit */
  endDayLabel: string
  endDayTooltip: string
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
  /** « 7h 30min » : durée des services moins durée des pauses */
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
 * Regroupe une page de pointages par journée (servicesByDay de useUserServices.ts) :
 * - une pause est rattachée au service de travail qui la contient (pause de nuit), sinon à sa date ;
 * - chaque journée est triée chronologiquement, les journées de la plus récente à la plus ancienne ;
 * - total = durée des services moins durée des pauses.
 * Bug B-26 reproduit : le calcul porte sur la page affichée (20 pointages), le total d'une journée
 * à cheval sur deux pages est donc faux.
 */
export function groupServicesByDay(services: ServiceDTO[]): ServiceDay[] {
  const workIntervals = services
    .filter((s) => !s.isBreak)
    .map((s) => ({
      start: time(s.debut),
      end: s.fin ? time(s.fin) : Infinity,
      dateKey: toLocalDateKey(new Date(s.debut ?? '')),
    }))

  const resolveDayKey = (service: ServiceDTO): string => {
    if (service.isBreak) {
      const startTime = time(service.debut)
      const container = workIntervals.find((w) => startTime >= w.start && startTime <= w.end)
      if (container) return container.dateKey
    }
    return toLocalDateKey(new Date(service.debut ?? ''))
  }

  const grouped = new Map<string, ServiceDTO[]>()
  for (const service of services) {
    const dateKey = resolveDayKey(service)
    const list = grouped.get(dateKey)
    if (list) list.push(service)
    else grouped.set(dateKey, [service])
  }

  return [...grouped.entries()]
    .map(([dateKey, dayServices]): ServiceDay => {
      const [y, m, d] = dateKey.split('-').map(Number)
      const date = new Date(y || 1970, (m || 1) - 1, d || 1)

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
          }
        })

      const sum = (list: ServiceDTO[]) => list.reduce((total, s) => total + (s.duree || 0), 0)
      const totalSeconds =
        sum(dayServices.filter((s) => !s.isBreak)) - sum(dayServices.filter((s) => s.isBreak))
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
        totalHours: minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`,
        totalSeconds,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

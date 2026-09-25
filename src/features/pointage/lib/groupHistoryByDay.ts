import { toLocalDateKey } from '@/lib/dates'
import type { ServiceDTO } from '@/models'
import { countLabel } from './formatters'

export type DayGroup = {
  /** Clé de date locale `YYYY-MM-DD` */
  date: string
  dayName: string
  dateFormatted: string
  totalHours: string
  countLabel: string
  services: ServiceDTO[]
}

/**
 * Regroupe l'historique par jour (clé de date **locale**, comme Pointage.vue), du plus récent au
 * plus ancien. Total du jour = somme des `duree` des services hors pauses, **sans** retrancher les
 * pauses (bug B-14 reproduit, voir `computeTodayWorkedMs`).
 */
export function groupHistoryByDay(history: ServiceDTO[]): DayGroup[] {
  const groups = new Map<string, DayGroup>()

  for (const service of history) {
    if (!service.debut) continue
    const date = new Date(service.debut)
    if (Number.isNaN(date.getTime())) continue
    const dateKey = toLocalDateKey(date)

    let group = groups.get(dateKey)
    if (!group) {
      group = {
        date: dateKey,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        dateFormatted: date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        totalHours: '0h 00m',
        countLabel: '',
        services: [],
      }
      groups.set(dateKey, group)
    }
    group.services.push(service)
  }

  for (const group of groups.values()) {
    let totalSeconds = 0
    for (const service of group.services) {
      if (!service.isBreak && service.duree) totalSeconds += service.duree
    }
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    group.totalHours = `${hours}h ${minutes.toString().padStart(2, '0')}m`
    group.countLabel = countLabel(group.services)
  }

  return Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date))
}

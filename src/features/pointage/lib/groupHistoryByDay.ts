import { parseLocalDateKey } from '@/lib/dates'
import { groupLinesByServiceDay, sumWorkSeconds } from '@/lib/serviceLines'
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

/** « 7h 05m » */
function formatDayTotal(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

/**
 * Regroupe une page de l'historique (lignes à plat) par jour, du plus récent au plus ancien. Un
 * service compte sur son jour de début, même s'il finit le lendemain, et ses pauses le suivent
 * (`serviceParentUuid`). Total du jour = somme des temps nets (`dureeTravail`) des services : les
 * pauses sont déduites (D12, fin du bug B-14), jamais additionnées une seconde fois. `elapsed`
 * fait avancer un service en cours.
 */
export function groupHistoryByDay(history: ServiceDTO[], elapsed = 0): DayGroup[] {
  return [...groupLinesByServiceDay(history).entries()]
    .map(([dateKey, lines]): DayGroup => {
      const date = parseLocalDateKey(dateKey) ?? new Date(dateKey)
      return {
        date: dateKey,
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        dateFormatted: date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        totalHours: formatDayTotal(sumWorkSeconds(lines, elapsed)),
        countLabel: countLabel(lines),
        services: lines,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

import type { ServiceDTO } from '@/models'

const toMs = (date: Date | string) => new Date(date).getTime()

/**
 * Temps travaillé du jour en direct (ms), repris tel quel de Pointage.vue (`todayWorkedTime`) :
 * services terminés moins les pauses **terminées** ; le service en cours ajoute `elapsedMs` ;
 * pendant une pause, le travail est figé au début de la pause.
 *
 * Bug B-14 reproduit (MIGRATION.md 8.2, Q-PAUSES) : ce chrono retranche les pauses, alors que le
 * total par jour de l'historique (`groupHistoryByDay`) ne les retranche pas.
 */
export function computeTodayWorkedMs(
  todayServices: ServiceDTO[],
  activeService: ServiceDTO | null,
  elapsedMs: number,
): number {
  let totalWorkMs = 0
  let totalBreakMs = 0

  for (const service of todayServices) {
    const startTime = service.debut ? toMs(service.debut) : 0
    if (!startTime) continue

    if (service.isBreak) {
      // Seules les pauses terminées sont retranchées : une pause en cours fige le chrono
      if (service.fin) {
        totalBreakMs += service.duree ? service.duree * 1000 : toMs(service.fin) - startTime
      }
    } else if (service.fin) {
      totalWorkMs += service.duree ? service.duree * 1000 : toMs(service.fin) - startTime
    } else if (activeService && !activeService.isBreak) {
      // Service en cours (hors pause)
      totalWorkMs += elapsedMs
    } else if (activeService?.isBreak && activeService.debut) {
      // En pause : le travail est figé au début de la pause
      totalWorkMs += toMs(activeService.debut) - startTime
    }
  }

  return Math.max(0, totalWorkMs - totalBreakMs)
}

const pad2 = (value: number) => value.toString().padStart(2, '0')

/** Chrono « HH:MM:SS » (largeur stable, lisible d'un coup d'œil). */
export function formatClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

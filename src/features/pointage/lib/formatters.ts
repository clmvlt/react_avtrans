import type { ServiceDTO } from '@/models'

/** Heure « HH:mm » d'un horodatage, `--:--` s'il est absent ou invalide (Pointage.vue, ServiceTimeline.vue). */
export function toTime(date?: Date | string): string {
  if (!date) return '--:--'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '--:--'
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/** Libellé de comptage « 2 services · 1 pause » (vide s'il n'y a rien). */
export function countLabel(services: ServiceDTO[]): string {
  const nbServices = services.filter((s) => !s.isBreak).length
  const nbPauses = services.filter((s) => s.isBreak).length
  const parts: string[] = []
  if (nbServices > 0) parts.push(`${nbServices} service${nbServices > 1 ? 's' : ''}`)
  if (nbPauses > 0) parts.push(`${nbPauses} pause${nbPauses > 1 ? 's' : ''}`)
  return parts.join(' · ')
}

/** Date du jour affichée dans la carte d'état : « jeudi 25 septembre ». */
export function formatTodayLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

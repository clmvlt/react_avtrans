import { startDayKey } from '@/lib/serviceLines'
import { formatOtherWorkdayHint } from '@/lib/workday'
import type { ServiceDTO, UserWithStatusDTO } from '@/models'

export type PresenceGroups = {
  present: UserWithStatusDTO[]
  onBreak: UserWithStatusDTO[]
  /** Statut ABSENT ou manquant */
  absent: UserWithStatusDTO[]
}

/** Répartit les employés par présence (compteurs de l'en-tête et sections). */
export function groupByPresence(users: UserWithStatusDTO[]): PresenceGroups {
  return {
    present: users.filter((user) => user.status === 'PRESENT'),
    onBreak: users.filter((user) => user.status === 'ON_BREAK'),
    absent: users.filter((user) => !user.status || user.status === 'ABSENT'),
  }
}

/** Filtre par « prénom nom », sans tenir compte de la casse. */
export function filterPresenceGroups(groups: PresenceGroups, search: string): PresenceGroups {
  if (!search.trim()) return groups
  const query = search.toLowerCase()
  const matches = (user: UserWithStatusDTO) =>
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(query)
  return {
    present: groups.present.filter(matches),
    onBreak: groups.onBreak.filter(matches),
    absent: groups.absent.filter(matches),
  }
}

/**
 * Mention à côté de `hoursToday` quand il porte sur la journée de la veille (service de nuit) :
 * « Journée du 12/10 », vide sinon.
 */
export const workdayHint = (user: UserWithStatusDTO, todayKey: string) =>
  formatOtherWorkdayHint(user.journee, todayKey)

/**
 * Le service en cours est-il hors de la journée comptée dans `hoursToday` ? Seulement sans
 * `journee` (ancienne API) pour un service commencé un autre jour : son temps net s'affiche alors
 * à part. Avec `journee`, la journée d'un service de nuit est déjà celle de `hoursToday`.
 */
export function isServiceOutsideWorkday(
  user: UserWithStatusDTO,
  service: ServiceDTO | null,
  todayKey: string,
): boolean {
  if (!service) return false
  return startDayKey(service) !== (user.journee || todayKey)
}

/**
 * Heures décimales en « 7h05 », « 0h00 » si nulles (heures du jour, `hoursToday` en direct, D12).
 * Bug B-18 reproduit : l'arrondi des minutes peut donner « 7h60 ».
 */
export function formatHoursToday(hours?: number): string {
  if (!hours || hours === 0) return '0h00'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h${m.toString().padStart(2, '0')}`
}

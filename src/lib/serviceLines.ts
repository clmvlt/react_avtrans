import type { ServiceDTO } from '@/models'
import { toLocalDateKey } from './dates'
import { isLineRunning, liveLineSeconds } from './liveCounter'

/**
 * Lignes de pointage (D12) : services de travail et pauses rattachées (`serviceParentUuid`,
 * `pauses`). Fonctions pures partagées par le pointage et les pointages d'un employé.
 */

const toDate = (value: ServiceDTO['debut']) => new Date(value ?? '')

/** Clé `YYYY-MM-DD` locale du début d'une ligne, `null` si elle n'a pas de début valide. */
export function startDayKey(line: ServiceDTO): string | null {
  const date = toDate(line.debut)
  return line.debut && !Number.isNaN(date.getTime()) ? toLocalDateKey(date) : null
}

/** Chaque service suivi de ses pauses (réponses où les pauses sont imbriquées : daily, month). */
export function withPauses(services: ServiceDTO[]): ServiceDTO[] {
  return services.flatMap((service) => [service, ...(service.pauses ?? [])])
}

/**
 * Regroupe une page de lignes à plat (historique, pointages d'un employé) par jour de
 * rattachement : un service compte sur son jour de début, même s'il finit le lendemain ; une pause
 * suit son service s'il est dans la page, sinon elle reste sur son propre jour de début. L'ordre
 * des lignes est conservé.
 */
export function groupLinesByServiceDay(lines: ServiceDTO[]): Map<string, ServiceDTO[]> {
  const serviceDays = new Map<string, string>()
  for (const line of lines) {
    const key = startDayKey(line)
    if (!line.isBreak && line.uuid && key) serviceDays.set(line.uuid, key)
  }

  const groups = new Map<string, ServiceDTO[]>()
  for (const line of lines) {
    const ownKey = startDayKey(line)
    if (!ownKey) continue
    const parentKey =
      line.isBreak && line.serviceParentUuid ? serviceDays.get(line.serviceParentUuid) : undefined
    const key = parentKey ?? ownKey
    const group = groups.get(key)
    if (group) group.push(line)
    else groups.set(key, [line])
  }
  return groups
}

/**
 * Temps de travail net de lignes, en secondes : somme des `dureeTravail` des services (les pauses
 * y sont déjà déduites par l'API ; elles ne sont jamais additionnées une seconde fois).
 */
export function sumWorkSeconds(lines: ServiceDTO[], elapsed: number): number {
  return lines.reduce(
    (total, line) => (line.isBreak ? total : total + liveLineSeconds(line, elapsed)),
    0,
  )
}

/** Au moins une ligne en cours (son compteur avance). */
export const hasRunningLine = (lines: ServiceDTO[]) => lines.some(isLineRunning)

/** « 21:00 » */
export function formatHourMinute(value: ServiceDTO['debut']): string {
  const date = toDate(value)
  if (!value || Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Début d'un pointage en cours : « 08:00 » s'il a commencé le jour `todayKey`, sinon
 * « le 12/10 à 21:00 » (service de nuit commencé la veille).
 */
export function formatSince(value: ServiceDTO['debut'], todayKey: string): string {
  const date = toDate(value)
  if (!value || Number.isNaN(date.getTime())) return '--:--'
  const time = formatHourMinute(value)
  if (toLocalDateKey(date) === todayKey) return time
  const dayMonth = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  return `le ${dayMonth} à ${time}`
}

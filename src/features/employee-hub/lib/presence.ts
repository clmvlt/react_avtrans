import { currentPause } from '@/lib/liveCounter'
import { formatSince } from '@/lib/serviceLines'
import type { UserWithStatusDTO } from '@/models'
import type { Presence } from './employeeDirectory'

export const PRESENCE_LABELS: Record<Presence, string> = {
  PRESENT: 'En service',
  ON_BREAK: 'En pause',
  ABSENT: 'Pas en service',
}

/** Pastille de présence (vert en service, ambre en pause, gris sinon). */
export const PRESENCE_DOT_CLASSES: Record<Presence, string> = {
  PRESENT: 'bg-success',
  ON_BREAK: 'bg-warning',
  ABSENT: 'bg-muted-foreground/40',
}

export const PRESENCE_TEXT_CLASSES: Record<Presence, string> = {
  PRESENT: 'text-success',
  ON_BREAK: 'text-warning',
  ABSENT: 'text-muted-foreground',
}

/**
 * « En service depuis 07:42 », « En pause depuis 10:05 », « Pas en service » : début du service
 * ou de la pause en cours, avec sa date s'il a commencé un autre jour.
 */
export function describePresence(
  presence: Presence,
  status: UserWithStatusDTO | null,
  todayKey: string,
): string {
  const label = PRESENCE_LABELS[presence]
  const service = presence !== 'ABSENT' ? status?.activeService : null
  if (!service) return label
  const start =
    presence === 'ON_BREAK' ? (currentPause(service)?.debut ?? service.debut) : service.debut
  return start ? `${label} depuis ${formatSince(start, todayKey)}` : label
}

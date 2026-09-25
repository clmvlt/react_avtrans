import type { ServiceDTO } from '@/models'

/** État du pointage : hors service, en service ou en pause. */
export type PointageStatus = 'off' | 'working' | 'break'

export function getPointageStatus(activeService: ServiceDTO | null): PointageStatus {
  if (!activeService) return 'off'
  return activeService.isBreak ? 'break' : 'working'
}

export const STATUS_TEXT: Record<PointageStatus, string> = {
  working: 'En service',
  break: 'En pause',
  off: 'Hors service',
}

/** Fond et bordure de la carte d'état. */
export const HERO_CLASS_NAME: Record<PointageStatus, string> = {
  working: 'border-green-500/30 bg-linear-to-br from-green-500/10 via-card to-card',
  break: 'border-amber-500/30 bg-linear-to-br from-amber-500/10 via-card to-card',
  off: 'bg-card',
}

/** Couleurs de la pastille d'état. */
export const STATUS_PILL_CLASS_NAME: Record<PointageStatus, string> = {
  working: 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400',
  break: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  off: 'border-border bg-muted text-muted-foreground',
}

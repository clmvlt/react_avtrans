import type { ActiveServiceResponse } from '@/services'

/** Statut d'un employé d'après son pointage en cours. */
export type AdminUserStatus = 'PRESENT' | 'ON_BREAK' | 'ABSENT'

export type AdminUserStatusInfo = {
  status: AdminUserStatus
  /** Début du pointage en cours (ISO), `null` si absent */
  activeServiceStart: string | null
  activeServiceUuid: string | null
}

export const ABSENT_STATUS: AdminUserStatusInfo = {
  status: 'ABSENT',
  activeServiceStart: null,
  activeServiceUuid: null,
}

/**
 * Statut déduit de GET /services/admin/{uuid}/active : pointage en cours = en service, ou en pause
 * si c'est une pause ; sinon (ou en cas d'erreur, côté page) absent.
 */
export function toStatusInfo(response: ActiveServiceResponse | null): AdminUserStatusInfo {
  const service = response?.service
  if (!response?.success || !service) return ABSENT_STATUS
  return {
    status: service.isBreak ? 'ON_BREAK' : 'PRESENT',
    activeServiceStart: service.debut,
    activeServiceUuid: service.uuid,
  }
}

/**
 * Libellé du statut, avec l'émoji du Vue (getStatusText de useUserServices.ts), affiché à côté de
 * la pastille de couleur.
 */
export function getStatusText(status: AdminUserStatus): string {
  switch (status) {
    case 'PRESENT':
      return '🟢 En service'
    case 'ON_BREAK':
      return '🟡 En pause'
    default:
      return '⚫ Absent'
  }
}

/** Couleurs du badge de statut. */
export function getStatusBadgeClass(status: AdminUserStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'border-green-500/50 text-green-600 dark:text-green-400'
    case 'ON_BREAK':
      return 'border-amber-500/50 text-amber-600 dark:text-amber-400'
    default:
      return ''
  }
}

/** Pastille de couleur du badge de statut (clignotante en service et en pause). */
export function getStatusDotClass(status: AdminUserStatus): string {
  switch (status) {
    case 'PRESENT':
      return 'bg-green-500 animate-pulse'
    case 'ON_BREAK':
      return 'bg-amber-500 animate-pulse'
    default:
      return 'bg-muted-foreground'
  }
}

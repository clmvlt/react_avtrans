import { currentPause, type Received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import type { ActiveServiceResponse } from '@/services'

/** Statut d'un employé d'après son pointage en cours. */
export type AdminUserStatus = 'PRESENT' | 'ON_BREAK' | 'ABSENT'

export type AdminUserStatusInfo = {
  status: AdminUserStatus
  /** Service de travail en cours, avec ses pauses ; `null` si absent */
  service: ServiceDTO | null
  /** Pause en cours du service (« Terminer la pause »), `null` sinon */
  pause: ServiceDTO | null
  /** Réception de la réponse (`performance.now()`) : base des durées en direct */
  receivedAt: number
}

export const ABSENT_STATUS: AdminUserStatusInfo = {
  status: 'ABSENT',
  service: null,
  pause: null,
  receivedAt: 0,
}

/**
 * Statut déduit de GET /services/admin/{uuid}/active, qui renvoie toujours le service de travail
 * (D12) : en pause si `enPause`, sinon en service ; absent sans service (ou en cas d'erreur, côté
 * page).
 */
export function toStatusInfo({
  data,
  receivedAt,
}: Received<ActiveServiceResponse | null>): AdminUserStatusInfo {
  const service = data?.service
  if (!data?.success || !service) return ABSENT_STATUS
  return {
    status: service.enPause ? 'ON_BREAK' : 'PRESENT',
    service,
    pause: service.enPause ? currentPause(service) : null,
    receivedAt,
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

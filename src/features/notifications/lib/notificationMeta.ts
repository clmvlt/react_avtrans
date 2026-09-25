import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  Bell,
  CalendarX,
  Car,
  CreditCard,
  History,
  ListChecks,
  UserPlus,
  Wrench,
} from 'lucide-react'
import type { NotificationDTO } from '@/models'

/**
 * Présentation et destination d'une notification selon son `refType`, partagées par le popover
 * de la navbar et la page /notifications (mêmes tables que les deux composants du Vue).
 * `rapport_vehicule` n'y figure pas, comme dans le Vue (B-08) : présenté comme « Général ».
 */

export type NotificationTypeMeta = {
  icon: LucideIcon
  /** Libellé du badge */
  label: string
  /** Couleurs de la pastille d'icône de la page /notifications (le popover garde une pastille neutre) */
  iconClassName: string
}

const NEUTRAL_ICON_CLASSES = 'bg-muted text-muted-foreground border-border'

const DEFAULT_META: NotificationTypeMeta = {
  icon: Bell,
  label: 'Général',
  iconClassName: NEUTRAL_ICON_CLASSES,
}

const META_BY_REF_TYPE: Record<string, NotificationTypeMeta> = {
  entretien: {
    icon: Wrench,
    label: 'Entretien',
    iconClassName:
      'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  },
  vehicule: {
    icon: Car,
    label: 'Véhicule',
    iconClassName:
      'bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
  },
  absence: {
    icon: CalendarX,
    label: 'Absence',
    iconClassName:
      'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  },
  acompte: {
    icon: Banknote,
    label: 'Acompte',
    iconClassName:
      'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  },
  user: {
    icon: UserPlus,
    label: 'Utilisateur',
    iconClassName: 'bg-primary/10 text-primary border-primary/20',
  },
  todo: {
    icon: ListChecks,
    label: 'Tâche',
    iconClassName: NEUTRAL_ICON_CLASSES,
  },
  carte_expiration: {
    icon: CreditCard,
    label: 'Carte',
    iconClassName:
      'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  },
  service_modification: {
    icon: History,
    label: 'Pointage',
    iconClassName:
      'bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  },
}

/** Icône, libellé et couleurs d'un type de notification (type absent ou inconnu : « Général »). */
export function getNotificationMeta(refType: string | null | undefined): NotificationTypeMeta {
  if (refType && Object.hasOwn(META_BY_REF_TYPE, refType)) {
    return META_BY_REF_TYPE[refType] ?? DEFAULT_META
  }
  return DEFAULT_META
}

export type NotificationDestination =
  | { kind: 'route'; to: string }
  /** Historique d'un pointage (modale globale, admins) : le pointage a pu être supprimé */
  | { kind: 'service-history'; serviceUuid: string }

/**
 * Où mène une notification (même table que le Vue).
 * `null` : pas de destination propre (sans refType ni refId, type inconnu, historique d'un
 * pointage pour un non-admin) ; le popover renvoie alors vers /notifications, la page ne fait rien.
 * Reproduit B-08 : absence et acompte mènent aux pages admin, même pour un utilisateur.
 */
export function getNotificationDestination(
  notification: Pick<NotificationDTO, 'refType' | 'refId'>,
  isAdmin: boolean,
): NotificationDestination | null {
  const { refType, refId } = notification
  if (!refType || !refId) return null

  switch (refType) {
    case 'entretien':
      return { kind: 'route', to: '/entretiens' }
    case 'vehicule':
      return { kind: 'route', to: `/vehicules/${refId}` }
    case 'absence':
      return { kind: 'route', to: '/absences' }
    case 'acompte':
      return { kind: 'route', to: '/acomptes' }
    case 'user':
      return { kind: 'route', to: '/users' }
    case 'todo':
      return { kind: 'route', to: '/todos' }
    case 'carte_expiration':
      return { kind: 'route', to: '/cartes' }
    case 'service_modification':
      return isAdmin ? { kind: 'service-history', serviceUuid: refId } : null
    default:
      return null
  }
}

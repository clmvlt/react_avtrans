import { UserStatus, UserStatusLabels } from '@/enums'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

/** Libellé de présence (« En service », « En pause », « Absent » si le statut manque). */
export function getPresenceLabel(status?: UserStatus): string {
  if (!status) return UserStatusLabels[UserStatus.ABSENT]
  return UserStatusLabels[status] || status
}

/** Variante du badge de présence. */
export function getPresenceBadgeVariant(status?: UserStatus): BadgeVariant {
  switch (status) {
    case UserStatus.PRESENT:
    case UserStatus.ON_BREAK:
      return 'outline'
    default:
      return 'secondary'
  }
}

/** Couleurs du badge de présence. */
export function getPresenceBadgeClass(status?: UserStatus): string {
  switch (status) {
    case UserStatus.PRESENT:
      return 'border-green-500/50 text-green-600 dark:text-green-400'
    case UserStatus.ON_BREAK:
      return 'border-amber-500/50 text-amber-600 dark:text-amber-400'
    default:
      return 'text-muted-foreground'
  }
}

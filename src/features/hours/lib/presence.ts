import { UserStatus, UserStatusLabels } from '@/enums'

/** Libellé de présence (Absent si aucun statut). */
export function getPresenceLabel(status?: UserStatus): string {
  if (!status) return UserStatusLabels[UserStatus.ABSENT]
  return UserStatusLabels[status] || status
}

export function getPresenceBadgeVariant(status?: UserStatus): 'outline' | 'secondary' {
  switch (status) {
    case UserStatus.PRESENT:
    case UserStatus.ON_BREAK:
      return 'outline'
    default:
      return 'secondary'
  }
}

/** En service en vert, en pause en ambre, absent grisé. */
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

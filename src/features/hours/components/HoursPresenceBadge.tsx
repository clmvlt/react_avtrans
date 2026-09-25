import { Badge } from '@/components/ui/badge'
import type { UserStatus } from '@/enums'
import { cn } from '@/lib/utils'
import { getPresenceBadgeClass, getPresenceBadgeVariant, getPresenceLabel } from '../lib/presence'

type HoursPresenceBadgeProps = {
  status?: UserStatus
  className?: string
}

/** Présence d'un employé : En service (vert), En pause (ambre), Absent. */
export function HoursPresenceBadge({ status, className }: HoursPresenceBadgeProps) {
  return (
    <Badge
      variant={getPresenceBadgeVariant(status)}
      className={cn(getPresenceBadgeClass(status), className)}
    >
      {getPresenceLabel(status)}
    </Badge>
  )
}

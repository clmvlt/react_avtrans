import { Badge } from '@/components/ui/badge'
import type { UserStatus } from '@/enums'
import {
  getPresenceBadgeClass,
  getPresenceBadgeVariant,
  getPresenceLabel,
} from '../lib/userPresence'

type PresenceBadgeProps = {
  status?: UserStatus
}

/** Présence d'un utilisateur : En service (vert), En pause (ambre), Absent. */
export function PresenceBadge({ status }: PresenceBadgeProps) {
  return (
    <Badge variant={getPresenceBadgeVariant(status)} className={getPresenceBadgeClass(status)}>
      {getPresenceLabel(status)}
    </Badge>
  )
}

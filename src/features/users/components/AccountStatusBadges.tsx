import { EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { UserDTO } from '@/models'
import { isUserVisible } from '@/utils/userVisibility'

type AccountStatusBadgesProps = {
  user: UserDTO
}

/** Statut du compte (Actif / Inactif) puis, s'il est masqué, le badge « Masqué ». */
export function AccountStatusBadges({ user }: AccountStatusBadgesProps) {
  return (
    <>
      <Badge
        variant={user.isActive ? 'outline' : 'destructive'}
        className={user.isActive ? 'border-green-500/50 text-green-600 dark:text-green-400' : ''}
      >
        {user.isActive ? 'Actif' : 'Inactif'}
      </Badge>
      {!isUserVisible(user) && (
        <Badge
          variant="secondary"
          className="gap-1"
          title="Masqué des services, du planning, des heures, des signatures et des véhicules"
        >
          <EyeOff className="size-3" />
          Masqué
        </Badge>
      )}
    </>
  )
}

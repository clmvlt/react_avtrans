import { UserAvatar } from '@/components/shared/UserAvatar'
import { cn } from '@/lib/utils'
import type { UserDTO, UserLastVehicleDTO } from '@/models'
import { isUserVisible } from '@/utils/userVisibility'
import type { UserActions } from '../hooks/useUserActions'
import { AccountStatusBadges } from './AccountStatusBadges'
import { LastVehicleInfo } from './LastVehicleInfo'
import { MailVerifiedBadge } from './MailVerifiedBadge'
import { PresenceBadge } from './PresenceBadge'
import { RoleBadge } from './RoleBadge'
import { UserActionsDropdown } from './UserActionsDropdown'
import { UserPhones } from './UserPhones'

type UserMobileCardProps = {
  user: UserDTO
  lastVehicle: UserLastVehicleDTO | undefined
  actions: UserActions
}

/** Carte d'un compte sous `md` : identité, menu d'actions, badges, dernier véhicule. */
export function UserMobileCard({ user, lastVehicle, actions }: UserMobileCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm',
        !isUserVisible(user) && 'border-dashed bg-muted/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="lg" />
          <div className="flex min-w-0 flex-col">
            <span className="font-medium text-foreground">
              {user.firstName} {user.lastName}
            </span>
            <span className="truncate text-sm text-muted-foreground">{user.email}</span>
            <UserPhones user={user} layout="column" />
          </div>
        </div>
        <UserActionsDropdown user={user} actions={actions} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RoleBadge role={user.role} />
        <PresenceBadge status={user.status} />
        <AccountStatusBadges user={user} />
        <MailVerifiedBadge verified={user.isMailVerified} short />
      </div>

      <LastVehicleInfo vehicle={lastVehicle} variant="card" />
    </div>
  )
}

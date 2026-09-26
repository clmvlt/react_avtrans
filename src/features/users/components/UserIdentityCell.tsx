import { UserAvatar } from '@/components/shared/UserAvatar'
import type { UserDTO } from '@/models'
import { UserPhones } from './UserPhones'

type UserIdentityCellProps = {
  user: UserDTO
}

/** Cellule « Utilisateurs » du tableau : avatar, nom, e-mail, téléphones. */
export function UserIdentityCell({ user }: UserIdentityCellProps) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar user={user} />
      <div className="flex min-w-0 flex-col">
        <span className="font-medium text-foreground">
          {user.firstName} {user.lastName}
        </span>
        <span className="truncate text-sm text-muted-foreground">{user.email}</span>
        <UserPhones user={user} layout="row" />
      </div>
    </div>
  )
}

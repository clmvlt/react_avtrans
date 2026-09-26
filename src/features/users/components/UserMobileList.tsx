import { Users2 } from 'lucide-react'
import { Empty } from '@/components/ui/empty'
import type { UserDTO, UserLastVehicleDTO } from '@/models'
import type { UserActions } from '../hooks/useUserActions'
import { UserMobileCard } from './UserMobileCard'

type UserMobileListProps = {
  users: UserDTO[]
  lastVehicles: Map<string, UserLastVehicleDTO> | undefined
  actions: UserActions
}

/** Liste des comptes en cartes, sous `md` (le tableau prend le relais au-dessus). */
export function UserMobileList({ users, lastVehicles, actions }: UserMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{users.length} utilisateur(s)</p>

      {users.length === 0 && (
        <Empty className="gap-3 p-0 py-12 text-muted-foreground md:p-0 md:py-12">
          <Users2 className="size-10 opacity-50" />
          <p>Aucun utilisateur trouvé</p>
        </Empty>
      )}

      {users.map((user) => (
        <UserMobileCard
          key={user.uuid}
          user={user}
          lastVehicle={user.uuid ? lastVehicles?.get(user.uuid) : undefined}
          actions={actions}
        />
      ))}
    </div>
  )
}

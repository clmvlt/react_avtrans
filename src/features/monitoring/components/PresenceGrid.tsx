import type { UserWithStatusDTO } from '@/models'
import type { MonitoringActions } from '../hooks/useMonitoringActions'
import { PresenceUserCard, type PresenceColor } from './PresenceUserCard'

type PresenceGridProps = {
  users: UserWithStatusDTO[]
  color: PresenceColor
  actions: MonitoringActions
}

/** Grille de cartes (2 à 6 colonnes selon la largeur). */
export function PresenceGrid({ users, color, actions }: PresenceGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {users.map((user) => (
        <PresenceUserCard key={user.uuid} user={user} color={color} actions={actions} />
      ))}
    </div>
  )
}

import type { UserWithStatusDTO } from '@/models'
import type { MonitoringActions } from '../hooks/useMonitoringActions'
import { PresenceGrid } from './PresenceGrid'
import type { PresenceColor } from './PresenceUserCard'

type PresenceSectionProps = {
  title: string
  /** Pastille du titre */
  dotClass: string
  users: UserWithStatusDTO[]
  color: PresenceColor
  actions: MonitoringActions
}

/** Section « Présents » ou « En pause » : titre avec compteur puis grille ; rien si vide. */
export function PresenceSection({ title, dotClass, users, color, actions }: PresenceSectionProps) {
  if (users.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">
        <span className={`size-2 rounded-full ${dotClass}`} />
        {title} ({users.length})
      </h2>
      <PresenceGrid users={users} color={color} actions={actions} />
    </section>
  )
}

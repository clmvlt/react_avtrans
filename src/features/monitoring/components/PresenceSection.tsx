import { cn } from '@/lib/utils'
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
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <span className={cn('size-2.5 rounded-full', dotClass)} />
        {title}
        <span className="text-sm font-normal text-muted-foreground">({users.length})</span>
      </h2>
      <PresenceGrid users={users} color={color} actions={actions} />
    </section>
  )
}

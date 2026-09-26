import type { ReactElement } from 'react'
import { Banknote, CalendarX2, ClipboardList, Clock } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { UserWithStatusDTO } from '@/models'
import type { MonitoringActions } from '../hooks/useMonitoringActions'

type PresenceUserContextMenuProps = {
  user: UserWithStatusDTO
  actions: MonitoringActions
  /** Carte de l'employé, qui ouvre le menu au clic droit */
  children: ReactElement
}

/** Menu du clic droit sur une carte du suivi des présences. */
export function PresenceUserContextMenu({ user, actions, children }: PresenceUserContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[12rem]">
        <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
          {user.firstName} {user.lastName}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => actions.goToServices(user)}>
          <ClipboardList className="size-4 text-current" />
          Gérer les services
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.openHours(user)}>
          <Clock className="size-4 text-current" />
          Heures
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => actions.goToAbsences(user)}>
          <CalendarX2 className="size-4 text-current" />
          Absences
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.goToAcomptes(user)}>
          <Banknote className="size-4 text-current" />
          Acomptes
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

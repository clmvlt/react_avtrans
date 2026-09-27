import { Banknote, CalendarX2, ClipboardList, Clock, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserWithStatusDTO } from '@/models'
import type { MonitoringActions } from '../hooks/useMonitoringActions'

type PresenceUserDropdownProps = {
  user: UserWithStatusDTO
  actions: MonitoringActions
}

/**
 * Menu « ⋮ » d'une carte. Il n'apparaît au survol qu'avec une souris ; au doigt et au clavier il
 * reste atteignable (dans le Vue, invisible sur tactile : corrigé par construction, 8.1).
 */
export function PresenceUserDropdown({ user, actions }: PresenceUserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          aria-label={`Actions pour ${user.firstName ?? ''} ${user.lastName ?? ''}`}
          className="absolute top-1 right-1 transition-opacity md:top-1.5 md:right-1.5 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100 pointer-fine:data-[state=open]:opacity-100"
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => actions.reloadToServices(user)}>
          <ClipboardList className="mr-2 size-4" />
          Services
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.openHours(user)}>
          <Clock className="mr-2 size-4" />
          Heures
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => actions.goToAbsences(user)}>
          <CalendarX2 className="mr-2 size-4" />
          Absences
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.goToAcomptes(user)}>
          <Banknote className="mr-2 size-4" />
          Acomptes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

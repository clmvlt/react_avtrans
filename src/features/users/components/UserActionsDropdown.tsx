import { CalendarOff, ClipboardList, Clock, Mail, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { UserDTO } from '@/models'
import type { UserActions } from '../hooks/useUserActions'

type UserActionsDropdownProps = {
  user: UserDTO
  actions: UserActions
}

/** Menu « ⋮ » des cartes mobiles : mêmes actions que le clic droit du tableau. */
export function UserActionsDropdown({ user, actions }: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => actions.goToServices(user)}>
          <ClipboardList className="mr-2 size-4" />
          Services
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.openHours(user)}>
          <Clock className="mr-2 size-4" />
          Heures
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.goToAbsences(user)}>
          <CalendarOff className="mr-2 size-4" />
          Absences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => actions.openEmail(user)}>
          <Mail className="mr-2 size-4" />
          Modifier l'email
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.openEdit(user)}>
          <Pencil className="mr-2 size-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => actions.confirmDelete(user)}
        >
          <Trash2 className="mr-2 size-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

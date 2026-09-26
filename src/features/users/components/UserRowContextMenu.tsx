import type { ReactElement } from 'react'
import { CalendarOff, ClipboardList, Clock, Mail, Pencil, Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { UserDTO } from '@/models'
import type { UserActions } from '../hooks/useUserActions'

type UserRowContextMenuProps = {
  user: UserDTO
  actions: UserActions
  /** Ligne du tableau (`<tr>`) qui ouvre le menu au clic droit. */
  children: ReactElement
}

/** Menu du clic droit sur une ligne du tableau des utilisateurs (ContextMenuPopover du Vue). */
export function UserRowContextMenu({ user, actions, children }: UserRowContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[12rem]">
        <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
          {`${user.firstName ?? ''} ${user.lastName ?? ''}`}
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => actions.goToServices(user)}>
          <ClipboardList className="size-4 text-current" />
          Services
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.openHours(user)}>
          <Clock className="size-4 text-current" />
          Heures
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.goToAbsences(user)}>
          <CalendarOff className="size-4 text-current" />
          Absences
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => actions.openEmail(user)}>
          <Mail className="size-4 text-current" />
          Modifier l'email
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.openEdit(user)}>
          <Pencil className="size-4 text-current" />
          Modifier
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => actions.confirmDelete(user)}>
          <Trash2 className="size-4" />
          Supprimer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

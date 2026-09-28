import { CheckCircle2, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { VehiculeRelaiDTO } from '@/models'
import type { RelaiActions } from '../../hooks/useRelaiDialogs'

type RelaiActionsMenuProps = {
  relai: VehiculeRelaiDTO
  actions: RelaiActions
  /** « Terminer le relais » est déjà un bouton visible à côté du menu. */
  hideEnd?: boolean
}

/** Menu « ⋮ » d'un relais : modifier, terminer (s'il n'a pas de date de fin), supprimer. */
export function RelaiActionsMenu({ relai, actions, hideEnd = false }: RelaiActionsMenuProps) {
  const canEnd = !hideEnd && !relai.dateFin

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions du relais ${relai.immat}`}
        >
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => actions.edit(relai)}>
          <Pencil className="mr-2 size-4" />
          Modifier
        </DropdownMenuItem>
        {canEnd && (
          <DropdownMenuItem onSelect={() => actions.end(relai)}>
            <CheckCircle2 className="mr-2 size-4" />
            Terminer le relais
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => actions.remove(relai)}>
          <Trash2 className="mr-2 size-4 text-current" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

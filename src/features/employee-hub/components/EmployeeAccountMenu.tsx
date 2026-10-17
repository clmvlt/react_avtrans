import { Mail, MoreVertical, Pencil, Trash2, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type EmployeeAccountMenuProps = {
  onEdit: () => void
  onEditEmail: () => void
  onDelete: () => void
}

/** Menu « ⋮ » du compte de l'employé : modification, e-mail, suppression. */
export function EmployeeAccountMenu({ onEdit, onEditEmail, onDelete }: EmployeeAccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Actions sur le compte">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="mr-2 size-4" />
          Modifier le compte
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onEditEmail}>
          <Mail className="mr-2 size-4" />
          Modifier l&apos;email
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/users">
            <Users className="mr-2 size-4" />
            Tous les comptes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="mr-2 size-4" />
          Supprimer le compte
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type DossierActionsProps = {
  /** Dossier sélectionné (fond primaire) : boutons en blanc translucide. */
  selected: boolean
  onEdit: () => void
  onDelete: () => void
}

const onPrimary = 'text-primary-foreground/70 hover:bg-white/20 hover:text-primary-foreground'

/**
 * Actions d'un dossier : boutons au survol (ou au focus) en desktop, menu ⋮ en mobile. Les clics
 * ne sélectionnent pas le dossier (propagation arrêtée, y compris depuis le menu en portail).
 */
export function DossierActions({ selected, onEdit, onDelete }: DossierActionsProps) {
  return (
    <>
      <div className="absolute right-3 hidden gap-1 md:group-focus-within:flex md:group-hover:flex">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn('size-6', selected && onPrimary)}
          title="Modifier"
          aria-label="Modifier le dossier"
          onClick={(event) => {
            event.stopPropagation()
            onEdit()
          }}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn('size-6', selected ? onPrimary : 'hover:text-destructive')}
          title="Supprimer"
          aria-label="Supprimer le dossier"
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn('size-6 shrink-0 md:hidden', selected && onPrimary)}
            aria-label="Actions du dossier"
            onClick={(event) => event.stopPropagation()}
          >
            <EllipsisVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="mr-2 size-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="mr-2 size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

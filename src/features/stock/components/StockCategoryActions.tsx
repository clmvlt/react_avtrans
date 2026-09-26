import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type StockCategoryActionsProps = {
  /** Catégorie sélectionnée : boutons clairs sur fond primary. */
  selected: boolean
  onEdit: () => void
  onDelete: () => void
}

const onPrimaryClassName =
  'text-primary-foreground/70 hover:bg-white/20 hover:text-primary-foreground'

/**
 * Actions d'une catégorie : crayon et corbeille au survol (desktop, aussi au focus clavier),
 * menu ⋮ en mobile. Les clics ne remontent pas jusqu'à l'entrée (qui sélectionnerait la catégorie).
 */
export function StockCategoryActions({ selected, onEdit, onDelete }: StockCategoryActionsProps) {
  return (
    <>
      <div
        className="absolute right-3 hidden gap-1 md:group-focus-within:flex md:group-hover:flex"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn('size-6', selected && onPrimaryClassName)}
          title="Modifier"
          aria-label="Modifier"
          onClick={onEdit}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn('size-6', selected ? onPrimaryClassName : 'hover:text-destructive')}
          title="Supprimer"
          aria-label="Supprimer"
          onClick={onDelete}
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
            className={cn('size-6 shrink-0 md:hidden', selected && onPrimaryClassName)}
            aria-label="Actions de la catégorie"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        {/* Le menu est dans un portail, mais ses événements remontent l'arbre React */}
        <DropdownMenuContent
          align="end"
          className="w-40"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

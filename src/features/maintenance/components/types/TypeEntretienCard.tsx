import type { DragEvent } from 'react'
import { EllipsisVertical, Folder, GripVertical, Pencil, Trash2, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TypeEntretienDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatLongDate } from '../../lib/entretienDates'

type TypeEntretienCardProps = {
  type: TypeEntretienDTO
  /** Badge du dossier (vue « Tous » seulement). */
  showFolder: boolean
  /** Glisser-déposer, modification et suppression. */
  canManage: boolean
  dragSourceProps: {
    onDragStart: (event: DragEvent) => void
    onDragEnd: () => void
  }
  onEdit: (type: TypeEntretienDTO) => void
  onDelete: (type: TypeEntretienDTO) => void
}

const truncate = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`

/** Carte d'un type d'entretien, déplaçable vers un dossier de la barre latérale. */
export function TypeEntretienCard({
  type,
  showFolder,
  canManage,
  dragSourceProps,
  onEdit,
  onDelete,
}: TypeEntretienCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:shadow-sm',
        canManage && 'cursor-grab active:cursor-grabbing',
      )}
      draggable={canManage}
      {...(canManage ? dragSourceProps : {})}
    >
      {canManage && (
        <div className="hidden cursor-grab p-1 text-muted-foreground active:cursor-grabbing md:block">
          <GripVertical className="size-4" />
        </div>
      )}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Wrench className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{type.nom}</span>
          {type.dossier && showFolder && (
            <Badge variant="outline" className="gap-1">
              <Folder className="size-3" />
              {type.dossier.nom}
            </Badge>
          )}
        </div>
        {type.description && (
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            {truncate(type.description, 100)}
          </p>
        )}
        <span className="text-xs text-muted-foreground">
          Créé le {formatLongDate(type.createdAt, '-')}
        </span>
      </div>

      {canManage && (
        <>
          <div className="hidden shrink-0 gap-1 md:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Modifier"
              aria-label="Modifier"
              onClick={() => onEdit(type)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Supprimer"
              aria-label="Supprimer"
              onClick={() => onDelete(type)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Actions"
              >
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => onEdit(type)}>
                <Pencil className="mr-2 size-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(type)}>
                <Trash2 className="mr-2 size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}

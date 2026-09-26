import { MoreVertical, Pencil, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty } from '@/components/ui/empty'
import type { TypeCarteDTO } from '@/models'
import { formatLongDate } from '../lib/cartes'

type TypeCarteMobileListProps = {
  types: TypeCarteDTO[]
  onEdit: (typeCarte: TypeCarteDTO) => void
  onDelete: (typeCarte: TypeCarteDTO) => void
}

/** Vue mobile des types de cartes (masquée à partir de `md`). */
export function TypeCarteMobileList({ types, onEdit, onDelete }: TypeCarteMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{types.length} type(s)</p>

      {types.length === 0 && (
        <Empty className="gap-3 rounded-none p-0 py-12 text-muted-foreground md:p-0 md:py-12">
          <Tag className="size-10 opacity-50" />
          <p>Aucun type de carte configuré</p>
        </Empty>
      )}

      {types.map((type) => (
        <div key={type.uuid} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Tag className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">{type.nom}</span>
                {type.description && (
                  <span className="text-sm text-muted-foreground">{type.description}</span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Actions du type">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={() => onEdit(type)}>
                  <Pencil className="size-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(type)}>
                  <Trash2 className="size-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Créé le {formatLongDate(type.createdAt)}
          </p>
        </div>
      ))}
    </div>
  )
}

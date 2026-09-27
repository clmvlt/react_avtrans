import { CalendarX, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AbsenceTypeDTO } from '@/models'
import { getModeDecompteOption } from '../../lib/absenceDecompte'
import { formatDateLong } from '../../lib/dateFormat'

type AbsenceTypeMobileListProps = {
  types: AbsenceTypeDTO[]
  onEdit: (type: AbsenceTypeDTO) => void
  onDelete: (type: AbsenceTypeDTO) => void
}

/** Types d'absence en cartes (sous `md`), avec menu Modifier / Supprimer. */
export function AbsenceTypeMobileList({ types, onEdit, onDelete }: AbsenceTypeMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{types.length} type(s)</p>

      {types.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <CalendarX className="size-10 opacity-50" />
          <p>Aucun type d&apos;absence configuré</p>
        </div>
      )}

      {types.map((type) => (
        <div key={type.uuid} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="size-10 shrink-0 rounded-md border border-border"
                style={{ backgroundColor: type.color }}
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">{type.name}</span>
                <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {type.color}
                </code>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Actions">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={() => onEdit(type)}>
                  <Pencil className="mr-2 size-4 text-current" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(type)}>
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-3 text-sm text-foreground">
            {getModeDecompteOption(type.modeDecompte).label}
            <span className="text-muted-foreground">
              {' · '}
              {type.compteHeures === false ? "ne compte pas d'heures" : 'compte dans les heures'}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Créé le {formatDateLong(type.createdAt)}
          </p>
        </div>
      ))}
    </div>
  )
}

import { BedDouble, EllipsisVertical, Eye, Trash2 } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CouchetteDTO } from '@/models'
import { formatCouchetteDate, formatCouchetteDateTime } from '../lib/couchetteDates'

type CouchetteMobileListProps = {
  /** Mêmes lignes (et même tri) que la table desktop. */
  couchettes: CouchetteDTO[]
  totalElements: number
  onDetail: (couchette: CouchetteDTO) => void
  onDelete: (couchette: CouchetteDTO) => void
}

/** Cartes de /couchettes sous `md`, actions dans un menu ⋮. */
export function CouchetteMobileList({
  couchettes,
  totalElements,
  onDetail,
  onDelete,
}: CouchetteMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{totalElements} couchette(s)</p>

      {couchettes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <BedDouble className="size-10 opacity-50" />
          <p>Aucune couchette trouvée</p>
        </div>
      )}

      {couchettes.map((couchette, index) => (
        <div key={couchette.uuid ?? index} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={couchette.user} />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {couchette.user?.firstName} {couchette.user?.lastName}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {formatCouchetteDate(couchette.date)}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Actions">
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onSelect={() => onDetail(couchette)}>
                  <Eye className="mr-2 size-4" />
                  Détails
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(couchette)}>
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Créée le {formatCouchetteDateTime(couchette.createdAt)}
          </p>
        </div>
      ))}
    </div>
  )
}

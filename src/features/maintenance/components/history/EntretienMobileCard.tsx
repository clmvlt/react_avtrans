import { EllipsisVertical, Euro, FolderOpen, Pencil, Route, Trash2, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatLongDate } from '../../lib/entretienDates'
import {
  formatCout,
  formatKm,
  getEntretienFileCount,
  mecanicienFullName,
  type EntretienRow,
  type EntretienRowActions,
} from '../../lib/entretienRow'

type EntretienMobileCardProps = EntretienRowActions & {
  entretien: EntretienRow
  /** Immatriculation avant le type (/entretiens). */
  showVehicle: boolean
  /** Entrées « Modifier » et « Supprimer » du menu. */
  canManage: boolean
}

/**
 * Carte d'un entretien sous `md`. Comme le Vue, le menu ⋮ est toujours affiché, même s'il n'a
 * aucune entrée (entretien sans fichier, sans droit de gestion).
 */
export function EntretienMobileCard({
  entretien,
  showVehicle,
  canManage,
  onOpenFiles,
  onEdit,
  onDelete,
}: EntretienMobileCardProps) {
  const fileCount = getEntretienFileCount(entretien)
  const typeBadge = <Badge variant="secondary">{entretien.typeEntretien?.nom}</Badge>

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {showVehicle ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-wide text-foreground uppercase">
                {entretien.vehiculeImmat}
              </span>
              {typeBadge}
            </div>
          ) : (
            typeBadge
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {formatLongDate(entretien.dateEntretien)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Actions">
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {fileCount > 0 && (
              <DropdownMenuItem onSelect={() => onOpenFiles(entretien)}>
                <FolderOpen className="mr-2 size-4" />
                Voir fichiers ({fileCount})
              </DropdownMenuItem>
            )}
            {canManage && (
              <>
                <DropdownMenuItem onSelect={() => onEdit(entretien)}>
                  <Pencil className="mr-2 size-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(entretien)}>
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Route className="size-3.5" />
          <span className="font-mono">{formatKm(entretien.kilometrage)} km</span>
        </div>
        {entretien.cout ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Euro className="size-3.5" />
            <span>{formatCout(entretien.cout)}</span>
          </div>
        ) : null}
        <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
          <User className="size-3.5" />
          <span>{mecanicienFullName(entretien)}</span>
        </div>
      </div>

      {entretien.commentaire && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{entretien.commentaire}</p>
      )}

      {fileCount > 0 && (
        <div className="mt-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-primary transition-colors hover:bg-accent"
            onClick={() => onOpenFiles(entretien)}
          >
            <FolderOpen className="size-3.5" />
            <span>{fileCount} fichier(s)</span>
          </button>
        </div>
      )}
    </div>
  )
}

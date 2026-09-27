import { Pencil, Trash2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VehiculeEquipementDTO } from '@/models'

type EquipementCardProps = {
  equipement: VehiculeEquipementDTO
  canManage: boolean
  onEdit: (equipement: VehiculeEquipementDTO) => void
  onDelete: (equipement: VehiculeEquipementDTO) => void
}

/**
 * Équipement du véhicule : nom, quantité, commentaire. Les boutons Modifier / Supprimer
 * n'apparaissent qu'au survol à la souris, comme le Vue, mais restent visibles au tactile et au
 * focus clavier.
 */
export function EquipementCard({ equipement, canManage, onEdit, onDelete }: EquipementCardProps) {
  return (
    <div className="group rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wrench className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="leading-tight font-medium">{equipement.nom}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                × {equipement.quantite ?? 1}
              </span>
            </div>
            {equipement.commentaire && (
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                {equipement.commentaire}
              </p>
            )}
          </div>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-1 transition-opacity pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Modifier ${equipement.nom ?? "l'équipement"}`}
              onClick={() => onEdit(equipement)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              aria-label={`Supprimer ${equipement.nom ?? "l'équipement"}`}
              onClick={() => onDelete(equipement)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

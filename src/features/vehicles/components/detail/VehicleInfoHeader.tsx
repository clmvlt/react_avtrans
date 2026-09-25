import { ArrowLeft, Pencil } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import type { VehiculeDTO } from '@/models'
import { formatDate } from '../../lib/formatters'

type VehicleInfoHeaderProps = {
  vehicule: VehiculeDTO
  vehiculeId: string
  /** En édition, seul le retour à la liste reste affiché. */
  isEditing: boolean
  canEdit: boolean
  onEdit?: () => void
}

/** Ligne du haut de la fiche : retour à la liste, date de création, Entretiens, Modifier. */
export function VehicleInfoHeader({
  vehicule,
  vehiculeId,
  isEditing,
  canEdit,
  onEdit,
}: VehicleInfoHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link to="/vehicules">
          <ArrowLeft className="mr-1.5 size-4" />
          Véhicules
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        {!isEditing && (
          <>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Créé le {formatDate(vehicule.createdAt)}
            </span>
            <Button asChild variant="default" size="sm" title="Voir les entretiens">
              <Link to={`/entretiens/vehicule/${vehiculeId}`}>Entretiens</Link>
            </Button>
            {canEdit && (
              <Button type="button" variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="mr-1.5 size-3.5" />
                Modifier
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

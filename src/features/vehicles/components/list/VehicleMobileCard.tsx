import { Eye, MoreVertical, Trash2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { VehiculeDTO } from '@/models'
import { formatDate, formatNumber } from '../../lib/formatters'
import { getVehicleOwnKm } from '../../lib/relais'
import { VehicleIdentity } from '../VehicleIdentity'

type VehicleMobileCardProps = {
  vehicule: VehiculeDTO
  canDelete: boolean
  onDetails: (vehicule: VehiculeDTO) => void
  onEntretiens: (vehicule: VehiculeDTO) => void
  onDelete: (vehicule: VehiculeDTO) => void
}

/** Carte d'un véhicule sous md : identité, menu d'actions, dernier relevé, commentaire. */
export function VehicleMobileCard({
  vehicule,
  canDelete,
  onDetails,
  onEntretiens,
  onDelete,
}: VehicleMobileCardProps) {
  // Kilométrage du véhicule lui-même, hors relais (D9)
  const { km, date } = getVehicleOwnKm(vehicule)

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <VehicleIdentity vehicule={vehicule} avatarClassName="size-12" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Actions">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => onDetails(vehicule)}>
              <Eye className="mr-2 size-4" />
              Détails
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEntretiens(vehicule)}>
              <Wrench className="mr-2 size-4" />
              Entretiens
            </DropdownMenuItem>
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => onDelete(vehicule)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {!!km && <span className="font-medium text-foreground">{formatNumber(km)} km</span>}
        {date && <span className="text-muted-foreground">{formatDate(date)}</span>}
      </div>
      {vehicule.comment && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground italic">{vehicule.comment}</p>
      )}
    </div>
  )
}

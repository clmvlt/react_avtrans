import { Calendar, FileText, Fuel, Hash, MessageSquare, Shield, Weight } from 'lucide-react'
import type { VehiculeDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatDateShort, formatNumber } from '../../lib/formatters'
import { InfoTile } from './InfoTile'

type VehicleDetailsGridProps = {
  vehicule: VehiculeDTO
  className?: string
}

/**
 * Informations techniques et d'assurance (masquées si vides), puis le commentaire, toujours
 * affiché. Les échéances (assurance, contrôle technique) et le véhicule relais (D9) sont dans les
 * cartes du haut de la fiche.
 */
export function VehicleDetailsGrid({ vehicule, className }: VehicleDetailsGridProps) {
  const hasDetails = Boolean(
    vehicule.vin ||
    vehicule.numeroCarteGrise ||
    vehicule.dateMiseEnCirculation ||
    vehicule.typeCarburant ||
    vehicule.ptac ||
    vehicule.assureur ||
    vehicule.numeroContratAssurance,
  )

  return (
    <div className={cn('space-y-4', className)}>
      {hasDetails ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
          {vehicule.vin && (
            <InfoTile icon={Hash} label="VIN" valueClassName="font-mono break-all">
              {vehicule.vin}
            </InfoTile>
          )}
          {vehicule.numeroCarteGrise && (
            <InfoTile icon={FileText} label="Carte grise">
              {vehicule.numeroCarteGrise}
            </InfoTile>
          )}
          {vehicule.dateMiseEnCirculation && (
            <InfoTile icon={Calendar} label="Mise en circulation">
              {formatDateShort(vehicule.dateMiseEnCirculation)}
            </InfoTile>
          )}
          {vehicule.typeCarburant && (
            <InfoTile icon={Fuel} label="Carburant">
              {vehicule.typeCarburant}
            </InfoTile>
          )}
          {!!vehicule.ptac && (
            <InfoTile icon={Weight} label="PTAC">
              {formatNumber(vehicule.ptac)} kg
            </InfoTile>
          )}
          {vehicule.assureur && (
            <InfoTile icon={Shield} label="Assureur">
              {vehicule.assureur}
            </InfoTile>
          )}
          {vehicule.numeroContratAssurance && (
            <InfoTile icon={FileText} label="N° contrat d'assurance">
              {vehicule.numeroContratAssurance}
            </InfoTile>
          )}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Aucune information technique renseignée.</p>
      )}

      <dl className="border-t pt-4">
        <InfoTile
          icon={MessageSquare}
          label="Commentaire"
          valueClassName={cn(
            'mt-1 font-normal',
            vehicule.comment ? 'text-foreground' : 'text-muted-foreground italic',
          )}
        >
          {vehicule.comment || 'Aucun commentaire'}
        </InfoTile>
      </dl>
    </div>
  )
}

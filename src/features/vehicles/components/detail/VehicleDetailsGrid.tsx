import {
  Calendar,
  CalendarClock,
  ClipboardCheck,
  FileText,
  Fuel,
  Hash,
  MessageSquare,
  Shield,
  Weight,
} from 'lucide-react'
import type { VehiculeDTO } from '@/models'
import { cn } from '@/lib/utils'
import { EXPIRY_TEXT_CLASS, getExpiryStatus } from '../../lib/expiryStatus'
import { formatDateShort, formatNumber } from '../../lib/formatters'
import { InfoTile } from './InfoTile'

type VehicleDetailsGridProps = {
  vehicule: VehiculeDTO
}

const GRID_CLASS = 'grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3'

/**
 * Informations techniques, assurance et contrôle technique (tuiles masquées si vides), puis le
 * commentaire, toujours affiché. Échéances en orange sous 30 jours, en rouge une fois passées.
 */
export function VehicleDetailsGrid({ vehicule }: VehicleDetailsGridProps) {
  const hasTechnical = Boolean(
    vehicule.vin ||
    vehicule.numeroCarteGrise ||
    vehicule.dateMiseEnCirculation ||
    vehicule.typeCarburant ||
    vehicule.ptac,
  )
  const hasInsurance = Boolean(
    vehicule.numeroContratAssurance ||
    vehicule.assureur ||
    vehicule.dateExpirationAssurance ||
    vehicule.dateProchainControleTechnique,
  )

  return (
    <div className="space-y-3 border-t px-5 py-4">
      {hasTechnical && (
        <div className={GRID_CLASS}>
          {vehicule.vin && (
            <InfoTile icon={Hash} label="VIN" valueClassName="font-mono">
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
        </div>
      )}

      {hasInsurance && (
        <div className={GRID_CLASS}>
          {vehicule.assureur && (
            <InfoTile icon={Shield} label="Assureur">
              {vehicule.assureur}
            </InfoTile>
          )}
          {vehicule.numeroContratAssurance && (
            <InfoTile icon={FileText} label="N° contrat">
              {vehicule.numeroContratAssurance}
            </InfoTile>
          )}
          {vehicule.dateExpirationAssurance && (
            <InfoTile
              icon={CalendarClock}
              label="Expiration assurance"
              valueClassName={EXPIRY_TEXT_CLASS[getExpiryStatus(vehicule.dateExpirationAssurance)]}
            >
              {formatDateShort(vehicule.dateExpirationAssurance)}
            </InfoTile>
          )}
          {vehicule.dateProchainControleTechnique && (
            <InfoTile
              icon={ClipboardCheck}
              label="Prochain CT"
              valueClassName={
                EXPIRY_TEXT_CLASS[getExpiryStatus(vehicule.dateProchainControleTechnique)]
              }
            >
              {formatDateShort(vehicule.dateProchainControleTechnique)}
            </InfoTile>
          )}
        </div>
      )}

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
    </div>
  )
}

import { ClipboardCheck, ShieldCheck } from 'lucide-react'
import type { VehiculeDTO } from '@/models'
import type { RelaiActions } from '../../hooks/useRelaiDialogs'
import { getVehicleOwnKm } from '../../lib/relais'
import { VehicleAvatar } from '../VehicleAvatar'
import { VehicleRelaiCard } from '../relais/VehicleRelaiCard'
import { VehicleDetailsGrid } from './VehicleDetailsGrid'
import { VehicleExpiryCard } from './VehicleExpiryCard'
import { VehicleKmCard } from './VehicleKmCard'

type VehicleInfoCardProps = {
  vehicule: VehiculeDTO
  vehiculeId: string
  /** Bouton « Ajouter un relevé » (admin ou mécanicien). */
  canManage: boolean
  /** Relevé ajouté depuis la carte du kilométrage. */
  onKmAdded: () => void
  /** Dialogs des relais, tenus par la page (D9). */
  relaiActions: RelaiActions
}

/**
 * Fiche du véhicule en lecture (VehiculeInfoCard.vue) : véhicule relais (D9), cartes des
 * informations clés (kilométrage du véhicule, contrôle technique, assurance), puis photo et
 * informations détaillées. L'édition remplace ce bloc par `VehicleEditForm`.
 */
export function VehicleInfoCard({
  vehicule,
  vehiculeId,
  canManage,
  onKmAdded,
  relaiActions,
}: VehicleInfoCardProps) {
  return (
    <div className="space-y-4">
      {canManage && (
        <VehicleRelaiCard vehicule={vehicule} vehiculeId={vehiculeId} actions={relaiActions} />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <VehicleKmCard
          vehiculeId={vehiculeId}
          latestKm={getVehicleOwnKm(vehicule).km}
          relaiImmat={vehicule.relaiEnCours?.immat}
          canAdd={canManage}
          onKmAdded={onKmAdded}
          className="col-span-2 lg:col-span-1"
        />
        <VehicleExpiryCard
          icon={ClipboardCheck}
          label="Contrôle technique"
          date={vehicule.dateProchainControleTechnique}
          hint="Prochain contrôle"
        />
        <VehicleExpiryCard
          icon={ShieldCheck}
          label="Assurance"
          date={vehicule.dateExpirationAssurance}
          hint="Date d'expiration"
        />
      </div>

      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 className="mb-4 text-base font-semibold text-foreground">Informations</h2>
        <div className="flex flex-col gap-5 sm:flex-row">
          <VehicleAvatar
            pictureUrl={vehicule.pictureUrl}
            alt={vehicule.immat}
            className="size-24 rounded-lg sm:size-28"
            iconClassName="size-10"
          />
          <VehicleDetailsGrid vehicule={vehicule} className="min-w-0 flex-1" />
        </div>
      </section>
    </div>
  )
}

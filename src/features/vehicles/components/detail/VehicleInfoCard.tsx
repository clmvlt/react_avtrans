import { ClipboardCheck, ShieldCheck } from 'lucide-react'
import type { VehiculeDTO } from '@/models'
import { VehicleAvatar } from '../VehicleAvatar'
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
}

/**
 * Fiche du véhicule en lecture (VehiculeInfoCard.vue) : cartes des informations clés
 * (kilométrage, contrôle technique, assurance), puis photo et informations détaillées.
 * L'édition remplace ce bloc par `VehicleEditForm`.
 */
export function VehicleInfoCard({
  vehicule,
  vehiculeId,
  canManage,
  onKmAdded,
}: VehicleInfoCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <VehicleKmCard
          vehiculeId={vehiculeId}
          latestKm={vehicule.latestKm}
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

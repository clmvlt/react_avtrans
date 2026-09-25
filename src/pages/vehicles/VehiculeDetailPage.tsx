import { useParams } from 'react-router'
import { VehicleDetailView } from '@/features/vehicles/components/detail/VehicleDetailView'

/**
 * Détail d'un véhicule (`/vehicules/:id`, admin ou mécanicien). La clé repart de zéro (onglet,
 * édition, pagination) quand l'identifiant change sans démontage de la route.
 */
export default function VehiculeDetailPage() {
  const { id = '' } = useParams()
  return <VehicleDetailView key={id} vehiculeId={id} />
}

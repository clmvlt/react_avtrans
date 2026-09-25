import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { VehiculeDTO } from '@/models'
import { useDeleteVehicleMutation } from '../../api/useDeleteVehicleMutation'
import { getErrorMessage } from '../../lib/errors'

type VehicleDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicule: VehiculeDTO | null
}

/**
 * Suppression d'un véhicule, confirmée en tapant « CONFIRMER » (Vehicules.vue:491). Pas de toast
 * de succès, comme le Vue ; une erreur passe par un toast et laisse le dialog ouvert (le Vue
 * remplaçait toute la liste par le message).
 */
export function VehicleDeleteDialog({ open, onOpenChange, vehicule }: VehicleDeleteDialogProps) {
  const deleteVehicle = useDeleteVehicleMutation()

  const handleConfirm = () => {
    if (!vehicule?.id) return
    deleteVehicle.mutate(vehicule.id, {
      onSuccess: () => onOpenChange(false),
      onError: (error) => toast.error(getErrorMessage(error, 'Erreur lors de la suppression')),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer le véhicule"
      description="Confirmer la suppression du véhicule"
      hideDescription
      confirmText="CONFIRMER"
      confirmLabel="Supprimer définitivement"
      pendingLabel="Suppression..."
      isPending={deleteVehicle.isPending}
      onConfirm={handleConfirm}
    >
      <p className="text-center text-foreground">
        Êtes-vous sûr de vouloir supprimer ce véhicule ?
      </p>

      <div className="rounded-lg bg-muted p-4 text-center">
        <p className="text-xl font-bold tracking-wider text-primary uppercase">{vehicule?.immat}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {vehicule?.brand} {vehicule?.model}
        </p>
      </div>

      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-left">
        <p className="mb-2 flex items-center gap-2 font-semibold text-destructive">
          <AlertTriangle className="size-4" />
          Attention : Cette action est irréversible !
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          La suppression de ce véhicule entraînera également la suppression de :
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Toutes ses photos</li>
          <li>Tous ses historiques de kilométrage</li>
          <li>Toutes ses informations d'ajustement</li>
        </ul>
      </div>
    </ConfirmDialog>
  )
}

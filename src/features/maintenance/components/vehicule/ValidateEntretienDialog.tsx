import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { TypeEntretienDTO, VehiculeDTO } from '@/models'
import { getTodayDate } from '@/utils/timeFormatters'
import { useCreateEntretienMutation } from '../../api/useEntretienMutations'
import { toNoonDateTime } from '../../lib/entretienDates'
import { notifyError, notifySuccess } from '../../lib/notify'

type ValidateEntretienDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicule: VehiculeDTO | null | undefined
  typeEntretien: TypeEntretienDTO | null
}

/**
 * « Valider l'entretien » d'EntretiensVehicule.vue : crée un entretien du type de l'échéance, à la
 * date du jour et au dernier kilométrage du véhicule (0 s'il n'y a pas de relevé, comme le Vue).
 */
export function ValidateEntretienDialog({
  open,
  onOpenChange,
  vehicule,
  typeEntretien,
}: ValidateEntretienDialogProps) {
  const createEntretien = useCreateEntretienMutation()

  const handleConfirm = () => {
    if (!vehicule?.id || !typeEntretien?.id) return
    createEntretien.mutate(
      {
        vehiculeId: vehicule.id,
        typeEntretienId: typeEntretien.id,
        // Bug B-01 reproduit : date du jour calculée en UTC
        dateEntretien: toNoonDateTime(getTodayDate()),
        kilometrage: vehicule.latestKm || 0,
        cout: undefined,
        commentaire: '',
        files: undefined,
      },
      {
        onSuccess: () => {
          notifySuccess('Entretien créé avec succès')
          onOpenChange(false)
        },
        onError: () => notifyError("Erreur lors de la création de l'entretien"),
      },
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="default"
      icon={null}
      title="Valider l'entretien"
      description="Confirmation de la validation de l'entretien."
      confirmLabel="Valider"
      isPending={createEntretien.isPending}
      onConfirm={handleConfirm}
    >
      <div className="text-center">
        <p className="text-foreground">
          Voulez-vous créer un entretien &quot;{typeEntretien?.nom ?? ''}&quot; pour ce véhicule
          avec la date et le kilométrage actuels ?
        </p>
      </div>
    </ConfirmDialog>
  )
}

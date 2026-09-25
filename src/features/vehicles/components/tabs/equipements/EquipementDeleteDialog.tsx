import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { VehiculeEquipementDTO } from '@/models'
import { useDeleteEquipementMutation } from '../../../api/useDeleteEquipementMutation'
import { getErrorMessage } from '../../../lib/errors'
import { FormErrorBanner } from '../../FormErrorBanner'

type EquipementDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculeId: string
  equipement: VehiculeEquipementDTO | null
}

/** Confirmation de suppression d'un équipement (VehiculeEquipementDeleteModal.vue). */
export function EquipementDeleteDialog({
  open,
  onOpenChange,
  vehiculeId,
  equipement,
}: EquipementDeleteDialogProps) {
  const deleteEquipement = useDeleteEquipementMutation(vehiculeId)

  const handleOpenChange = (next: boolean) => {
    // L'erreur d'une tentative précédente ne réapparaît pas à la réouverture
    if (!next) deleteEquipement.reset()
    onOpenChange(next)
  }

  const handleConfirm = () => {
    if (!equipement?.id) return
    deleteEquipement.mutate(equipement.id, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Supprimer l'équipement"
      description="Confirmation de suppression d'équipement"
      hideDescription
      confirmLabel="Supprimer"
      isPending={deleteEquipement.isPending}
      onConfirm={handleConfirm}
    >
      {deleteEquipement.isError && (
        <FormErrorBanner>
          {getErrorMessage(deleteEquipement.error, 'Erreur lors de la suppression')}
        </FormErrorBanner>
      )}
      <p className="text-sm text-muted-foreground">
        Êtes-vous sûr de vouloir supprimer l'équipement{' '}
        <span className="font-medium text-foreground">{equipement?.nom}</span> ? Cette action est
        irréversible.
      </p>
    </ConfirmDialog>
  )
}

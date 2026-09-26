import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useDeleteEntretienMutation } from '../api/useEntretienMutations'
import type { EntretienRow } from '../lib/entretienRow'
import { notifyError, notifySuccess } from '../lib/notify'
import { IrreversibleNotice } from './IrreversibleNotice'

type EntretienDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entretien: EntretienRow | null
  /** Mise en page du texte : Entretiens.vue (`inline`) ou EntretiensVehicule.vue (`centered`). */
  variant: 'inline' | 'centered'
}

/** Confirmation de suppression d'un entretien (« Confirmer la suppression »). */
export function EntretienDeleteDialog({
  open,
  onOpenChange,
  entretien,
  variant,
}: EntretienDeleteDialogProps) {
  const deleteEntretien = useDeleteEntretienMutation()

  const handleConfirm = () => {
    if (!entretien?.id) return
    deleteEntretien.mutate(
      { id: entretien.id, vehiculeId: entretien.vehiculeId },
      {
        onSuccess: () => {
          notifySuccess('Entretien supprimé avec succès')
          onOpenChange(false)
        },
        onError: () => notifyError("Erreur lors de la suppression de l'entretien"),
      },
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirmer la suppression"
      description="Cette action est irréversible."
      icon={null}
      isPending={deleteEntretien.isPending}
      onConfirm={handleConfirm}
    >
      <IrreversibleNotice
        variant={variant}
        message="Êtes-vous sûr de vouloir supprimer cet entretien ?"
      />
    </ConfirmDialog>
  )
}

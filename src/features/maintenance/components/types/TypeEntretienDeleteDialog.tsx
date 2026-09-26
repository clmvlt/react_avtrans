import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { TypeEntretienDTO } from '@/models'
import { useDeleteTypeEntretienMutation } from '../../api/useTypeEntretienMutations'
import { notifyError, notifySuccess } from '../../lib/notify'

type TypeEntretienDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: TypeEntretienDTO | null
}

/** Confirmation « Supprimer le type d'entretien » (TypesEntretien.vue). */
export function TypeEntretienDeleteDialog({
  open,
  onOpenChange,
  type,
}: TypeEntretienDeleteDialogProps) {
  const deleteType = useDeleteTypeEntretienMutation()

  const handleConfirm = () => {
    if (!type?.id) return
    deleteType.mutate(type.id, {
      onSuccess: () => {
        notifySuccess('Type supprimé avec succès !', 'Succès')
        onOpenChange(false)
      },
      onError: () => notifyError('Erreur lors de la suppression', 'Erreur'),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer le type d'entretien"
      description="Cette action est irréversible."
      icon={null}
      pendingLabel="Suppression..."
      isPending={deleteType.isPending}
      onConfirm={handleConfirm}
    >
      <p className="text-foreground">
        Êtes-vous sûr de vouloir supprimer le type <strong>{type?.nom}</strong> ?
      </p>
    </ConfirmDialog>
  )
}

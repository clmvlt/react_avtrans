import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { DossierTypeEntretienDTO } from '@/models'
import { useDeleteDossierMutation } from '../../api/useDossierMutations'
import { notifyError, notifySuccess } from '../../lib/notify'

type DossierDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dossier: DossierTypeEntretienDTO | null
  /** Après la suppression (la page revient sur « Tous » si ce dossier était affiché). */
  onDeleted: (dossierId: string) => void
}

/**
 * Confirmation « Supprimer le dossier » (TypesEntretien.vue). Ses types passent dans
 * « Non classés ».
 */
export function DossierDeleteDialog({
  open,
  onOpenChange,
  dossier,
  onDeleted,
}: DossierDeleteDialogProps) {
  const deleteDossier = useDeleteDossierMutation()

  const handleConfirm = () => {
    const id = dossier?.id
    if (!id) return
    deleteDossier.mutate(id, {
      onSuccess: () => {
        onDeleted(id)
        onOpenChange(false)
        notifySuccess('Dossier supprimé avec succès !', 'Succès')
      },
      onError: () => notifyError('Erreur lors de la suppression', 'Erreur'),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer le dossier"
      description="Cette action est irréversible."
      icon={null}
      pendingLabel="Suppression..."
      isPending={deleteDossier.isPending}
      onConfirm={handleConfirm}
    >
      <div className="space-y-3">
        <p className="text-foreground">
          Êtes-vous sûr de vouloir supprimer le dossier <strong>{dossier?.nom}</strong> ?
        </p>
        <p className="text-sm text-muted-foreground">
          Les types d&apos;entretien de ce dossier seront déplacés vers &quot;Non classés&quot;.
        </p>
      </div>
    </ConfirmDialog>
  )
}

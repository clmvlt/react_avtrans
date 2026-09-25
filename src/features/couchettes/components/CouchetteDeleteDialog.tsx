import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { CouchetteDTO } from '@/models'
import { useDeleteCouchetteMutation } from '../api/useDeleteCouchetteMutation'
import { CouchetteUserSummary } from './CouchetteUserSummary'

type CouchetteDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  couchette: CouchetteDTO | null
  /** Suppression réussie (dialog déjà fermé) : la page recharge sa page courante. */
  onDeleted: () => void
}

/**
 * Confirmation de suppression d'une couchette (admin). Bouton désactivé pendant la requête (le
 * Vue permettait un double DELETE) ; une erreur passe par un toast et laisse le dialog ouvert.
 */
export function CouchetteDeleteDialog({
  open,
  onOpenChange,
  couchette,
  onDeleted,
}: CouchetteDeleteDialogProps) {
  const deleteCouchette = useDeleteCouchetteMutation()

  const handleConfirm = () => {
    if (!couchette?.uuid) return
    deleteCouchette.mutate(couchette.uuid, {
      onSuccess: () => {
        toast.success('Succès', { description: 'Couchette supprimée avec succès', duration: 5000 })
        onOpenChange(false)
        onDeleted()
      },
      onError: (error) => {
        toast.error('Erreur', {
          description: error.message || 'Erreur lors de la suppression',
          duration: 7000,
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer la couchette"
      description="Confirmer la suppression"
      hideDescription
      className="sm:max-w-lg"
      isPending={deleteCouchette.isPending}
      onConfirm={handleConfirm}
    >
      {couchette && (
        <div className="space-y-5">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="mb-2 font-medium text-foreground">
              Êtes-vous sûr de vouloir supprimer cette couchette ?
            </p>
            <p className="text-sm font-semibold text-destructive">Cette action est irréversible.</p>
          </div>
          <CouchetteUserSummary couchette={couchette} />
        </div>
      )}
    </ConfirmDialog>
  )
}

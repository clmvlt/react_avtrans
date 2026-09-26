import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { CarteDTO } from '@/models'
import { useDeleteCarteMutation } from '../api/useDeleteCarteMutation'

type CarteDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  carte: CarteDTO | null
}

/** Confirmation de suppression d'une carte. */
export function CarteDeleteDialog({ open, onOpenChange, carte }: CarteDeleteDialogProps) {
  const deleteMutation = useDeleteCarteMutation()

  const handleConfirm = () => {
    if (!carte?.uuid) return
    deleteMutation.mutate(carte.uuid, {
      onSuccess: () => {
        toast.success('Succès', { description: 'Carte supprimée avec succès' })
        onOpenChange(false)
      },
      onError: (error) =>
        toast.error('Erreur', {
          description: (error instanceof Error && error.message) || 'Erreur lors de la suppression',
        }),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer la carte"
      description="Cette action est irréversible."
      icon={null}
      isPending={deleteMutation.isPending}
      onConfirm={handleConfirm}
    >
      {carte && (
        <p className="text-sm text-muted-foreground">
          Êtes-vous sûr de vouloir supprimer la carte &quot;{carte.nom}&quot; ? Cette action est
          irréversible.
        </p>
      )}
    </ConfirmDialog>
  )
}

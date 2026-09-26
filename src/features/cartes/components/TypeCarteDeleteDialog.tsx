import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { TypeCarteDTO } from '@/models'
import { useDeleteTypeCarteMutation } from '../api/useDeleteTypeCarteMutation'

type TypeCarteDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  typeCarte: TypeCarteDTO | null
}

/** Confirmation de suppression d'un type de carte. */
export function TypeCarteDeleteDialog({
  open,
  onOpenChange,
  typeCarte,
}: TypeCarteDeleteDialogProps) {
  const deleteMutation = useDeleteTypeCarteMutation()

  const handleConfirm = () => {
    if (!typeCarte?.uuid) return
    deleteMutation.mutate(typeCarte.uuid, {
      onSuccess: () => {
        toast.success('Succès', { description: 'Type de carte supprimé avec succès' })
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
      title="Supprimer le type de carte"
      description="Cette action est irréversible."
      icon={null}
      isPending={deleteMutation.isPending}
      onConfirm={handleConfirm}
    >
      {typeCarte && (
        <p className="text-sm text-muted-foreground">
          Êtes-vous sûr de vouloir supprimer le type &quot;{typeCarte.nom}&quot; ? Cette action est
          irréversible.
        </p>
      )}
    </ConfirmDialog>
  )
}

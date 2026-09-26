import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { TodoCategoryDTO } from '@/models'
import { useDeleteTodoCategoryMutation } from '../api/useDeleteTodoCategoryMutation'

type TodoCategoryDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: TodoCategoryDTO | null
}

/**
 * Confirmation de suppression d'une catégorie de tâches, sans avertissement sur les tâches
 * rattachées (comme le Vue).
 */
export function TodoCategoryDeleteDialog({
  open,
  onOpenChange,
  category,
}: TodoCategoryDeleteDialogProps) {
  const deleteMutation = useDeleteTodoCategoryMutation()

  const handleConfirm = () => {
    if (!category?.uuid) return
    deleteMutation.mutate(category.uuid, {
      onSuccess: () => {
        toast.success('Succès', { description: 'Catégorie supprimée' })
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
      title="Supprimer la catégorie"
      description="Confirmer la suppression de la catégorie"
      hideDescription
      isPending={deleteMutation.isPending}
      onConfirm={handleConfirm}
    >
      <p className="text-center text-muted-foreground">
        Voulez-vous vraiment supprimer la catégorie{' '}
        <strong className="text-foreground">{category?.name}</strong> ?
      </p>
    </ConfirmDialog>
  )
}

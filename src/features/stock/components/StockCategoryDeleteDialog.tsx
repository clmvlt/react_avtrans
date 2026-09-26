import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { StockCategoryDTO } from '@/models'
import { useDeleteStockCategoryMutation } from '../api/useDeleteStockCategoryMutation'

type StockCategoryDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: StockCategoryDTO | null
  /** Appelé après la suppression (la page revient sur « Tous » si la catégorie était affichée). */
  onDeleted: (categoryId: string) => void
}

/** Suppression d'une catégorie de stock ; ses articles passent dans « Non classés ». */
export function StockCategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onDeleted,
}: StockCategoryDeleteDialogProps) {
  const deleteMutation = useDeleteStockCategoryMutation()

  const handleConfirm = () => {
    const categoryId = category?.id
    if (!categoryId) return
    deleteMutation.mutate(categoryId, {
      onSuccess: () => {
        onDeleted(categoryId)
        onOpenChange(false)
        toast.success('Succès', { description: 'Catégorie supprimée avec succès !' })
      },
      onError: () => toast.error('Erreur', { description: 'Erreur lors de la suppression' }),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer la catégorie"
      description="Cette action est irréversible."
      icon={null}
      confirmLabel="Supprimer"
      pendingLabel="Suppression..."
      isPending={deleteMutation.isPending}
      onConfirm={handleConfirm}
    >
      <div className="space-y-3">
        <p className="text-foreground">
          Êtes-vous sûr de vouloir supprimer la catégorie <strong>{category?.nom}</strong> ?
        </p>
        <p className="text-sm text-muted-foreground">
          Les articles de cette catégorie seront déplacés vers &quot;Non classés&quot;.
        </p>
      </div>
    </ConfirmDialog>
  )
}

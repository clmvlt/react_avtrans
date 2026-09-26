import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { StockItemDTO } from '@/models'
import { useDeleteStockItemMutation } from '../api/useDeleteStockItemMutation'

type StockItemDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: StockItemDTO | null
}

/** Suppression d'un article, confirmée en tapant « CONFIRMER ». */
export function StockItemDeleteDialog({ open, onOpenChange, item }: StockItemDeleteDialogProps) {
  const deleteMutation = useDeleteStockItemMutation()

  const handleConfirm = () => {
    if (!item?.id) return
    deleteMutation.mutate(item.id, {
      onSuccess: () => {
        onOpenChange(false)
        toast.success('Succès', { description: 'Article supprimé avec succès !' })
      },
      onError: () => toast.error('Erreur', { description: 'Erreur lors de la suppression' }),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer l'article"
      description="Cette action est irréversible."
      icon={null}
      confirmText="CONFIRMER"
      confirmLabel="Supprimer"
      pendingLabel="Suppression..."
      isPending={deleteMutation.isPending}
      onConfirm={handleConfirm}
    >
      <p className="text-foreground">
        Êtes-vous sûr de vouloir supprimer l&apos;article <strong>{item?.nom}</strong> ?
      </p>
      <div className="rounded-md bg-muted p-4 text-center">
        <div className="font-mono text-sm tracking-wider text-primary">{item?.reference}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {item?.quantite} {item?.unite}
        </div>
      </div>
    </ConfirmDialog>
  )
}

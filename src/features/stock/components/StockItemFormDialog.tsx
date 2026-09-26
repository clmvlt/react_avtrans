import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { StockCategoryDTO, StockItemDTO } from '@/models'
import { StockItemForm } from './StockItemForm'

type StockItemFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Article modifié ; `null` en création. */
  item: StockItemDTO | null
  defaultCategoryId: string
  categories: StockCategoryDTO[]
}

/** Dialog « Nouvel article » / « Modifier l'article ». */
export function StockItemFormDialog({
  open,
  onOpenChange,
  item,
  defaultCategoryId,
  categories,
}: StockItemFormDialogProps) {
  const title = item ? "Modifier l'article" : 'Nouvel article'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        {/* Monté à chaque ouverture (et à chaque article) : valeurs et erreur repartent de zéro */}
        <StockItemForm
          key={item?.id ?? 'new'}
          item={item}
          defaultCategoryId={defaultCategoryId}
          categories={categories}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

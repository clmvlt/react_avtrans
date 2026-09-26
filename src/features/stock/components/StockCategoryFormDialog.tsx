import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { StockCategoryDTO } from '@/models'
import { StockCategoryForm } from './StockCategoryForm'

type StockCategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Catégorie modifiée ; `null` en création. */
  category: StockCategoryDTO | null
}

/** Dialog « Nouvelle catégorie » / « Modifier la catégorie ». */
export function StockCategoryFormDialog({
  open,
  onOpenChange,
  category,
}: StockCategoryFormDialogProps) {
  const title = category ? 'Modifier la catégorie' : 'Nouvelle catégorie'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <StockCategoryForm
          key={category?.id ?? 'new'}
          category={category}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

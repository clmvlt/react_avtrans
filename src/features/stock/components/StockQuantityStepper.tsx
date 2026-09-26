import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { StockItemDTO } from '@/models'
import { cn } from '@/lib/utils'
import { useAdjustStockQuantityMutation } from '../api/useAdjustStockQuantityMutation'
import { isLowStock } from '../lib/stock'

type StockQuantityStepperProps = {
  item: StockItemDTO
}

/**
 * Stepper −/+ de la quantité d'un article (mise à jour optimiste). « − » est désactivé à 0 ;
 * les deux boutons le sont pendant l'enregistrement de cet article.
 */
export function StockQuantityStepper({ item }: StockQuantityStepperProps) {
  const adjustMutation = useAdjustStockQuantityMutation()
  const quantite = item.quantite || 0

  const updateQuantity = (delta: number) => {
    if (!item.id) return
    const newQuantity = quantite + delta
    if (newQuantity < 0) return
    adjustMutation.mutate(
      { id: item.id, quantite: newQuantity, previousQuantite: item.quantite },
      { onError: () => toast.error('Erreur', { description: 'Erreur lors de la mise à jour' }) },
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="size-7 hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={quantite <= 0 || adjustMutation.isPending}
        title="Retirer 1"
        aria-label="Retirer 1"
        onClick={() => updateQuantity(-1)}
      >
        <Minus className="size-3" />
      </Button>
      <span
        className={cn(
          'min-w-10 text-center text-base font-bold',
          isLowStock(item.quantite) ? 'text-amber-600 dark:text-amber-400' : 'text-foreground',
        )}
      >
        {item.quantite}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="size-7 hover:border-green-500 hover:bg-green-500/10 hover:text-green-600"
        disabled={adjustMutation.isPending}
        title="Ajouter 1"
        aria-label="Ajouter 1"
        onClick={() => updateQuantity(1)}
      >
        <Plus className="size-3" />
      </Button>
      <span className="text-sm text-muted-foreground">{item.unite}</span>
    </div>
  )
}

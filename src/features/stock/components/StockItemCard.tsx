import type { DragEvent } from 'react'
import { GripVertical, MoreVertical, Package, Pencil, Tag, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { StockItemDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatPrice, isLowStock, truncateText } from '../lib/stock'
import { StockQuantityStepper } from './StockQuantityStepper'

type StockItemCardProps = {
  item: StockItemDTO
  canManage: boolean
  /** Badge de la catégorie (uniquement dans la vue « Tous »). */
  showCategory: boolean
  onDragStart: (event: DragEvent, item: StockItemDTO) => void
  onDragEnd: () => void
  onEdit: (item: StockItemDTO) => void
  onDelete: (item: StockItemDTO) => void
}

/** Carte d'un article, déplaçable vers une catégorie par glisser-déposer. */
export function StockItemCard({
  item,
  canManage,
  showCategory,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: StockItemCardProps) {
  const prixUnitaire = item.prixUnitaire

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30',
        canManage && 'cursor-grab active:cursor-grabbing',
      )}
      draggable={canManage}
      onDragStart={(event) => onDragStart(event, item)}
      onDragEnd={onDragEnd}
    >
      {canManage && (
        <div className="hidden cursor-grab p-1 text-muted-foreground active:cursor-grabbing md:block">
          <GripVertical className="size-4" />
        </div>
      )}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Package className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm tracking-wide text-primary">{item.reference}</span>
          <span className="font-semibold text-foreground">{item.nom}</span>
          {item.category && showCategory && (
            <Badge variant="outline" className="gap-1">
              <Tag className="size-3" />
              {item.category.nom}
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            {truncateText(item.description, 100)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {canManage ? (
            <StockQuantityStepper item={item} />
          ) : (
            <span
              className={cn(
                'text-sm font-semibold',
                isLowStock(item.quantite)
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-foreground',
              )}
            >
              {item.quantite} {item.unite}
            </span>
          )}
          {prixUnitaire != null && prixUnitaire > 0 && (
            <>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                {formatPrice(prixUnitaire)} € / {item.unite || 'pièce'}
              </span>
              <span className="text-sm font-semibold text-primary">
                Total : {formatPrice((item.quantite || 0) * prixUnitaire)} €
              </span>
            </>
          )}
        </div>
      </div>

      {canManage && (
        <>
          <div className="hidden shrink-0 gap-1 md:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Modifier"
              aria-label="Modifier"
              onClick={() => onEdit(item)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Supprimer"
              aria-label="Supprimer"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Actions de l'article"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => onEdit(item)}>
                <Pencil className="size-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(item)}>
                <Trash2 className="size-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}

import { Info, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type StockToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  canManage: boolean
  /** Affiche l'aide sur le glisser-déposer (seulement s'il y a des articles listés). */
  showDragHint: boolean
  onCreateItem: () => void
}

/** Recherche, aide sur le glisser-déposer (desktop) et bouton « Ajouter un article ». */
export function StockToolbar({
  searchQuery,
  onSearchChange,
  canManage,
  showDragHint,
  onCreateItem,
}: StockToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher par nom, référence ou description..."
          aria-label="Rechercher un article"
          className="pl-9"
        />
      </div>
      {canManage && showDragHint && (
        <div
          tabIndex={0}
          aria-label="Glissez-déposez les articles vers une catégorie"
          className="group/hint relative hidden shrink-0 cursor-default rounded-sm text-muted-foreground/40 transition-colors outline-none hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:block"
        >
          <Info className="size-3.5" />
          <div className="pointer-events-none absolute top-full right-0 z-50 mt-2 hidden rounded-md border bg-popover px-3 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover/hint:block group-focus-visible/hint:block">
            Glissez-déposez les articles vers une catégorie
          </div>
        </div>
      )}
      {canManage && (
        <Button type="button" size="sm" className="shrink-0" onClick={onCreateItem}>
          <Plus className="size-4" />
          Ajouter un article
        </Button>
      )}
    </div>
  )
}

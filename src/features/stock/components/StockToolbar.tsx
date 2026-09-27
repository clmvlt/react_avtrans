import { Info, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type StockToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  /** Aide sur le glisser-déposer (desktop, gestionnaire, s'il y a des articles listés). */
  showDragHint: boolean
}

/**
 * Recherche et aide sur le glisser-déposer. L'aide, une infobulle au survol dans le Vue, est
 * écrite en clair ; « Ajouter un article » est dans l'en-tête de la page.
 */
export function StockToolbar({ searchQuery, onSearchChange, showDragHint }: StockToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="relative w-full sm:max-w-md">
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
      {showDragHint && (
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <Info className="size-3.5 shrink-0" />
          Glissez-déposez un article sur une catégorie pour le classer.
        </p>
      )}
    </div>
  )
}

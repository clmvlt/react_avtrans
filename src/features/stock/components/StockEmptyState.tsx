import { PackageOpen } from 'lucide-react'
import { Empty } from '@/components/ui/empty'
import { UNCLASSIFIED, type StockCategorySelection } from '../lib/stock'

type StockEmptyStateProps = {
  searchQuery: string
  selection: StockCategorySelection
}

/** Liste vide : message selon la recherche ou la catégorie sélectionnée. */
export function StockEmptyState({ searchQuery, selection }: StockEmptyStateProps) {
  const message = searchQuery
    ? `Aucun article trouvé pour "${searchQuery}"`
    : selection === UNCLASSIFIED
      ? 'Aucun article non classé'
      : selection
        ? 'Cette catégorie est vide'
        : 'Aucun article en stock'

  return (
    <Empty className="gap-0 rounded-xl border border-dashed p-0 py-16 text-muted-foreground md:p-0 md:py-16">
      <PackageOpen className="mb-4 size-12 opacity-50" />
      <p>{message}</p>
    </Empty>
  )
}

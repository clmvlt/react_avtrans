import { Info, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type TypesToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  /** Aide « Glissez-déposez… » (desktop, gestionnaire, s'il y a des types affichés). */
  showDragHint: boolean
}

/**
 * Recherche et aide au glisser-déposer (TypesEntretien.vue). L'aide, une infobulle au survol dans
 * le Vue, est écrite en clair ; « Nouveau type » est dans l'en-tête de la page.
 */
export function TypesToolbar({ search, onSearchChange, showDragHint }: TypesToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher par nom ou description..."
          aria-label="Rechercher un type d'entretien"
          className="pl-9"
        />
      </div>
      {showDragHint && (
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <Info className="size-3.5 shrink-0" />
          Glissez-déposez un type sur un dossier pour le classer.
        </p>
      )}
    </div>
  )
}

import { Info, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type TypesToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  /** Aide « Glissez-déposez… » (desktop, s'il y a des types affichés). */
  showDragHint: boolean
  canManage: boolean
  onCreateType: () => void
}

/** Recherche, aide au glisser-déposer et « Ajouter un type » (TypesEntretien.vue). */
export function TypesToolbar({
  search,
  onSearchChange,
  showDragHint,
  canManage,
  onCreateType,
}: TypesToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
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
      {canManage && showDragHint && (
        // Infobulle CSS du Vue, affichée aussi au focus clavier
        <div
          tabIndex={0}
          aria-label="Glissez-déposez les types vers un dossier"
          className="group/hint relative hidden shrink-0 cursor-default rounded-sm text-muted-foreground/40 transition-colors outline-none hover:text-muted-foreground focus-visible:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 md:block"
        >
          <Info className="size-3.5" />
          <div
            role="tooltip"
            className="pointer-events-none absolute top-full right-0 z-50 mt-2 hidden rounded-md border bg-popover px-3 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md group-hover/hint:block group-focus-visible/hint:block"
          >
            Glissez-déposez les types vers un dossier
          </div>
        </div>
      )}
      {canManage && (
        <Button type="button" size="sm" className="shrink-0" onClick={onCreateType}>
          <Plus className="mr-1.5 size-4" />
          Ajouter un type
        </Button>
      )}
    </div>
  )
}

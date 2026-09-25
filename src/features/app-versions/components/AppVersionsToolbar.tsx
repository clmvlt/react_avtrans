import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type AppVersionsToolbarProps = {
  search: string
  onSearchChange: (search: string) => void
  onCreate: () => void
}

/** Recherche et bouton « Nouvelle version » au-dessus de la liste admin. */
export function AppVersionsToolbar({ search, onSearchChange, onCreate }: AppVersionsToolbarProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher..."
          aria-label="Rechercher une version"
          className="pl-9"
        />
      </div>
      <Button size="sm" onClick={onCreate} title="Nouvelle version">
        <Plus className="size-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Nouvelle version</span>
      </Button>
    </div>
  )
}

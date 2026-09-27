import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type AppVersionsToolbarProps = {
  search: string
  onSearchChange: (search: string) => void
}

/** Recherche au-dessus de la liste admin (la publication est dans l'en-tête de la page). */
export function AppVersionsToolbar({ search, onSearchChange }: AppVersionsToolbarProps) {
  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Version, fichier ou notes..."
        aria-label="Rechercher une version"
        className="pl-9"
      />
    </div>
  )
}

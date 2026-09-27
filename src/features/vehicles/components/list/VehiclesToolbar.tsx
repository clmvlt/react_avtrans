import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type VehiclesToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
}

/** Recherche au-dessus de la liste des véhicules (l'ajout est dans l'en-tête de la page). */
export function VehiclesToolbar({ search, onSearchChange }: VehiclesToolbarProps) {
  return (
    <div className="relative max-w-md">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Immatriculation, relais, marque ou modèle..."
        aria-label="Rechercher un véhicule"
        className="pl-9"
      />
    </div>
  )
}

import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type VehiclesToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  /** Affiche « Ajouter » (admin ou mécanicien). */
  canCreate: boolean
  onCreate: () => void
}

/** Recherche et bouton « Ajouter » au-dessus de la liste des véhicules. */
export function VehiclesToolbar({
  search,
  onSearchChange,
  canCreate,
  onCreate,
}: VehiclesToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher par immatriculation, relais, marque ou modèle..."
          aria-label="Rechercher un véhicule"
          className="pl-9"
        />
      </div>
      {canCreate && (
        <Button type="button" onClick={onCreate}>
          <Plus className="mr-2 size-4" />
          Ajouter
        </Button>
      )}
    </div>
  )
}

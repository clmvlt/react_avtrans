import { EyeOff, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

type UsersToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  showHidden: boolean
  onShowHiddenChange: (value: boolean) => void
  /** Nombre de comptes masqués, en pastille à côté de la case */
  hiddenCount: number
}

/** Recherche par nom ou e-mail et case « Afficher les masqués ». */
export function UsersToolbar({
  search,
  onSearchChange,
  showHidden,
  onShowHiddenChange,
  hiddenCount,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Rechercher par nom ou email..."
          aria-label="Rechercher par nom ou email"
          className="pl-9"
        />
      </div>
      <label
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5"
        title="Les utilisateurs masqués n'apparaissent pas dans les services, le planning, les heures, les signatures et les véhicules"
      >
        <Checkbox
          checked={showHidden}
          onCheckedChange={(checked) => onShowHiddenChange(checked === true)}
        />
        <EyeOff className="size-4 text-muted-foreground" />
        <span className="whitespace-nowrap">Afficher les masqués</span>
        {hiddenCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {hiddenCount}
          </Badge>
        )}
      </label>
    </div>
  )
}

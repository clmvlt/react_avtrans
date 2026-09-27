import { CalendarDays, Pencil, Route, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { VehiculeTypeEntretienDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatPeriodicite } from '../../lib/formatPeriodicite'

type VehiculeConfigCardProps = {
  config: VehiculeTypeEntretienDTO
  onEdit: (config: VehiculeTypeEntretienDTO) => void
  onDelete: (config: VehiculeTypeEntretienDTO) => void
}

/** Carte d'une configuration d'entretien du véhicule (grisée et badge « Inactif » si inactive). */
export function VehiculeConfigCard({ config, onEdit, onDelete }: VehiculeConfigCardProps) {
  return (
    <div className={cn('rounded-xl border bg-card p-4', !config.actif && 'opacity-60')}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-foreground">{config.typeEntretien?.nom}</span>
        {!config.actif && <Badge variant="secondary">Inactif</Badge>}
      </div>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        {config.periodiciteType === 'TEMPOREL' ? (
          <CalendarDays className="size-4" />
        ) : (
          <Route className="size-4" />
        )}
        <span>{formatPeriodicite(config)}</span>
      </div>
      <div className="flex justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Modifier"
          aria-label="Modifier"
          onClick={() => onEdit(config)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          title="Supprimer"
          aria-label="Supprimer"
          onClick={() => onDelete(config)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

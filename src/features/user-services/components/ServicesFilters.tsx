import { useId } from 'react'
import { Filter, Plus } from 'lucide-react'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  SERVICE_TYPE_OPTIONS,
  type AdminServiceFilters,
  type ServiceTypeFilter,
} from '../lib/serviceFilters'

type ServicesFiltersProps = {
  showFilters: boolean
  onToggleFilters: () => void
  filters: AdminServiceFilters
  onFiltersChange: (filters: AdminServiceFilters) => void
  hasActiveFilters: boolean
  onReset: () => void
  onApply: () => void
  onAdd: () => void
}

/** Bouton « Filtres », « Ajouter un service » et panneau des filtres (dates, type). */
export function ServicesFilters({
  showFilters,
  onToggleFilters,
  filters,
  onFiltersChange,
  hasActiveFilters,
  onReset,
  onApply,
  onAdd,
}: ServicesFiltersProps) {
  const id = useId()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={hasActiveFilters ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFilters}
          aria-expanded={showFilters}
        >
          <Filter className="mr-2 size-4" />
          {showFilters ? 'Masquer' : 'Filtres'}
          {hasActiveFilters && <span className="ml-1 font-bold text-amber-300">!</span>}
        </Button>
        <Button size="sm" onClick={onAdd}>
          <Plus className="mr-2 size-4" />
          Ajouter un service
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label htmlFor={`${id}-start`} className="text-sm font-medium text-muted-foreground">
                Date de début
              </label>
              <Input
                id={`${id}-start`}
                type="date"
                value={filters.startDate}
                onChange={(event) => onFiltersChange({ ...filters, startDate: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={`${id}-end`} className="text-sm font-medium text-muted-foreground">
                Date de fin
              </label>
              <Input
                id={`${id}-end`}
                type="date"
                value={filters.endDate}
                onChange={(event) => onFiltersChange({ ...filters, endDate: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Combobox
                label="Type"
                options={SERVICE_TYPE_OPTIONS}
                value={filters.type}
                onValueChange={(type) =>
                  onFiltersChange({ ...filters, type: (type || 'all') as ServiceTypeFilter })
                }
                searchable={false}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onReset}>
              Réinitialiser
            </Button>
            <Button size="sm" onClick={onApply}>
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

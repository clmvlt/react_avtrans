import { useId } from 'react'
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseLocalDateKey } from '@/lib/dates'
import { cn } from '@/lib/utils'
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
}

/** `YYYY-MM-DD` → « 12/09/2026 » (clé de date locale, sans passage par l'UTC). */
function formatDateKey(key: string): string {
  return parseLocalDateKey(key)?.toLocaleDateString('fr-FR') ?? key
}

/**
 * Résumé des champs saisis, sous le titre « Filtres ». Sans dates, l'API ne renvoie que les
 * 30 derniers jours (MIGRATION.md 8.3) : on le dit.
 */
function describeFilters({ startDate, endDate, type }: AdminServiceFilters): string {
  let period = '30 derniers jours'
  if (startDate && endDate) period = `Du ${formatDateKey(startDate)} au ${formatDateKey(endDate)}`
  else if (startDate) period = `Depuis le ${formatDateKey(startDate)}`
  else if (endDate) period = `Jusqu'au ${formatDateKey(endDate)}`

  const typeLabel =
    type === 'service'
      ? 'services seuls'
      : type === 'pause'
        ? 'pauses seules'
        : 'services et pauses'
  return `${period} · ${typeLabel}`
}

/**
 * Carte de filtres des pointages (même forme que `SearchFilters`) : en-tête « Filtres » avec le
 * résumé des champs saisis, bouton « Modifier » / « Masquer », puis dates, type et boutons
 * « Réinitialiser » / « Appliquer ».
 */
export function ServicesFilters({
  showFilters,
  onToggleFilters,
  filters,
  onFiltersChange,
  hasActiveFilters,
  onReset,
  onApply,
}: ServicesFiltersProps) {
  const id = useId()

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <SlidersHorizontal
          className={cn(
            'size-4 shrink-0',
            hasActiveFilters ? 'text-primary' : 'text-muted-foreground',
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Filtres</p>
          <p className="truncate text-xs text-muted-foreground">{describeFilters(filters)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={onToggleFilters}
          aria-expanded={showFilters}
          aria-controls={`${id}-panel`}
        >
          {showFilters ? 'Masquer' : 'Modifier'}
          <ChevronDown className={cn('size-4 transition-transform', showFilters && 'rotate-180')} />
        </Button>
      </div>

      {showFilters && (
        <div id={`${id}-panel`} className="border-t p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="size-4" />
              Réinitialiser
            </Button>
            <Button type="button" size="sm" onClick={onApply}>
              <Search className="size-4" />
              Appliquer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

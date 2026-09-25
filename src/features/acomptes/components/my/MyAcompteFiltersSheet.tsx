import { useId } from 'react'
import { ResponsiveFilterSheet } from '@/components/shared/ResponsiveFilterSheet'
import { Input } from '@/components/ui/input'
import type { MyAcompteFilters } from '../../lib/acompteFilters'

type MyAcompteFilterKey = 'montantMin' | 'montantMax' | 'startDate' | 'endDate'

type MyAcompteFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: MyAcompteFilters
  onFieldChange: (key: MyAcompteFilterKey, value: string) => void
  onApply: () => void
  onReset: () => void
}

/** Panneau « Filtrer mes acomptes » : montant min / max, du, au. */
export function MyAcompteFiltersSheet({
  open,
  onOpenChange,
  filters,
  onFieldChange,
  onApply,
  onReset,
}: MyAcompteFiltersSheetProps) {
  const id = useId()

  const renderField = (key: MyAcompteFilterKey, label: string, type: 'number' | 'date') => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-${key}`} className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={`${id}-${key}`}
        type={type}
        {...(type === 'number'
          ? {
              inputMode: 'decimal' as const,
              min: '0',
              placeholder: key === 'montantMin' ? 'Min' : 'Max',
            }
          : {})}
        value={filters[key]}
        onChange={(event) => onFieldChange(key, event.target.value)}
      />
    </div>
  )

  return (
    <ResponsiveFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtrer mes acomptes"
      description="Limitez la liste à un montant ou à une période."
      onApply={onApply}
      onReset={onReset}
    >
      <div className="grid grid-cols-2 gap-3 *:min-w-0">
        {renderField('montantMin', 'Montant min (€)', 'number')}
        {renderField('montantMax', 'Montant max (€)', 'number')}
      </div>
      <div className="grid gap-3">
        {renderField('startDate', 'Du', 'date')}
        {renderField('endDate', 'Au', 'date')}
      </div>
    </ResponsiveFilterSheet>
  )
}

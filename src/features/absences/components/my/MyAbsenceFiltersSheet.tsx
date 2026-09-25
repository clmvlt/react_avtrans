import { useId } from 'react'
import { Combobox } from '@/components/shared/Combobox'
import { ResponsiveFilterSheet } from '@/components/shared/ResponsiveFilterSheet'
import { Input } from '@/components/ui/input'
import type { AbsenceTypeDTO } from '@/models'
import type { MyAbsenceFilters } from '../../lib/absenceFilters'

type MyAbsenceFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: MyAbsenceFilters
  onFieldChange: (key: 'absenceTypeUuid' | 'startDate' | 'endDate', value: string) => void
  absenceTypes: AbsenceTypeDTO[]
  onApply: () => void
  onReset: () => void
}

/** Panneau « Filtrer mes absences » : type d'absence, du, au. */
export function MyAbsenceFiltersSheet({
  open,
  onOpenChange,
  filters,
  onFieldChange,
  absenceTypes,
  onApply,
  onReset,
}: MyAbsenceFiltersSheetProps) {
  const id = useId()
  const typeOptions = absenceTypes
    .filter((type) => type.uuid && type.name)
    .map((type) => ({ value: type.uuid!, label: type.name! }))

  return (
    <ResponsiveFilterSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtrer mes absences"
      description="Limitez la liste à un type d'absence ou à une période."
      onApply={onApply}
      onReset={onReset}
    >
      <Combobox
        label="Type d'absence"
        value={filters.absenceTypeUuid}
        options={typeOptions}
        placeholder="Tous les types"
        searchable={typeOptions.length > 5}
        clearable
        onValueChange={(value) => onFieldChange('absenceTypeUuid', value)}
      />
      <div className="grid gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-start`} className="text-sm font-medium text-muted-foreground">
            Du
          </label>
          <Input
            id={`${id}-start`}
            type="date"
            value={filters.startDate}
            onChange={(event) => onFieldChange('startDate', event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-end`} className="text-sm font-medium text-muted-foreground">
            Au
          </label>
          <Input
            id={`${id}-end`}
            type="date"
            value={filters.endDate}
            onChange={(event) => onFieldChange('endDate', event.target.value)}
          />
        </div>
      </div>
    </ResponsiveFilterSheet>
  )
}

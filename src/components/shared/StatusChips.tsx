import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type StatusChipOption = {
  /** Valeur du statut (`''` = tous). */
  value: string
  label: string
}

type StatusChipsProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  options: StatusChipOption[]
  value: string
  onValueChange: (value: string) => void
  /** Chargement en cours : puces non cliquables. */
  disabled?: boolean
}

/**
 * Puces de statut défilant horizontalement (pages « Mes absences » et « Mes acomptes ») :
 * puce active pleine, les autres en carte. `role="tablist"` comme le Vue.
 *
 * @example
 * <StatusChips options={CHIPS} value={filters.status} onValueChange={selectStatus} disabled={isFetching} />
 */
export function StatusChips({
  options,
  value,
  onValueChange,
  disabled = false,
  className,
  ...props
}: StatusChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrer par statut"
      className={cn(
        'flex flex-1 [scrollbar-width:none] gap-2 overflow-x-auto py-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    >
      {options.map((chip) => {
        const selected = value === chip.value
        return (
          <button
            key={chip.value}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => onValueChange(chip.value)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}

import { useId } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const CUSTOM_PRESETS = [
  { label: '2 mois', months: 2 },
  { label: '3 mois', months: 3 },
  { label: '6 mois', months: 6 },
]

const DATE_INPUT_CLASS =
  'h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-ring/20 focus:outline-none'

type CustomRangeControlsProps = {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  /** Plage complète et ordonnée : active « Afficher ». */
  isValid: boolean
  onApply: () => void
  onPreset: (months: number) => void
  error?: string
}

/** Mode « Personnalisé » : dates natives Du / Au, « Afficher » et préréglages 2, 3 et 6 mois. */
export function CustomRangeControls({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isValid,
  onApply,
  onPreset,
  error,
}: CustomRangeControlsProps) {
  const id = useId()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor={`${id}-start`} className="text-xs font-medium text-muted-foreground">
          Du
        </label>
        <input
          id={`${id}-start`}
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className={DATE_INPUT_CLASS}
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor={`${id}-end`} className="text-xs font-medium text-muted-foreground">
          Au
        </label>
        <input
          id={`${id}-end`}
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className={DATE_INPUT_CLASS}
        />
      </div>
      <Button type="button" size="sm" disabled={!isValid} aria-label="Afficher" onClick={onApply}>
        <Search className="size-3.5" />
        <span className="hidden sm:inline">Afficher</span>
      </Button>
      <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />
      <div className="flex items-center gap-1">
        {CUSTOM_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onPreset(preset.months)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      {error && <p className="w-full text-xs text-destructive">{error}</p>}
    </div>
  )
}

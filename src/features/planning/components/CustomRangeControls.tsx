import { useId } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const CUSTOM_PRESETS = [
  { label: '2 mois', months: 2 },
  { label: '3 mois', months: 3 },
  { label: '6 mois', months: 6 },
]

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

/**
 * Mode « Personnalisé » : dates natives Du / Au et « Afficher », puis raccourcis de 2, 3 et 6 mois
 * à partir du début du mois courant.
 */
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
        <label htmlFor={`${id}-start`} className="text-sm font-medium text-muted-foreground">
          Du
        </label>
        <Input
          id={`${id}-start`}
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="w-auto"
        />
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor={`${id}-end`} className="text-sm font-medium text-muted-foreground">
          Au
        </label>
        <Input
          id={`${id}-end`}
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="w-auto"
        />
      </div>
      <Button type="button" disabled={!isValid} onClick={onApply}>
        <Search className="size-4" />
        Afficher
      </Button>
      <Separator
        orientation="vertical"
        className="mx-1 hidden data-[orientation=vertical]:h-6 md:block"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm text-muted-foreground">À partir de ce mois :</span>
        {CUSTOM_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPreset(preset.months)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  )
}

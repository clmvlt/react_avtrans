import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MONTH_OPTIONS } from '../lib/contractFormat'

type MonthYearPickerProps = {
  month: number
  year: number
  yearOptions: { value: string; label: string }[]
  onChange: (value: { month: number; year: number }) => void
  onCurrentMonth: () => void
  /** Chargement en cours : flèches et « Mois actuel » désactivés. */
  disabled?: boolean
}

/**
 * Mois précédent / suivant, listes du mois et de l'année, « Mois actuel ». Les flèches peuvent
 * sortir des années proposées : la liste de l'année s'affiche alors vide, comme le Vue.
 */
export function MonthYearPicker({
  month,
  year,
  yearOptions,
  onChange,
  onCurrentMonth,
  disabled = false,
}: MonthYearPickerProps) {
  const goToPrevious = () =>
    onChange(month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year })
  const goToNext = () =>
    onChange(month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year })

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Mois précédent"
        disabled={disabled}
        onClick={goToPrevious}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Select
          value={String(month)}
          onValueChange={(value) => onChange({ month: parseInt(value) || 1, year })}
        >
          <SelectTrigger className="w-[140px]" aria-label="Mois">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(year)}
          onValueChange={(value) => onChange({ month, year: parseInt(value) || year })}
        >
          <SelectTrigger className="w-[100px]" aria-label="Année">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Mois suivant"
        disabled={disabled}
        onClick={goToNext}
      >
        <ChevronRight className="size-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onCurrentMonth}
      >
        Mois actuel
      </Button>
    </div>
  )
}

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { HoursPeriodController } from '../../hooks/useHoursPeriod'
import { FIRST_SELECTABLE_YEAR, getMonthName } from '../../lib/hoursPeriod'
import { PeriodNavigatorShell } from './PeriodNavigatorShell'

type MonthNavigatorProps = {
  controller: HoursPeriodController
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1),
  label: getMonthName(index + 1),
}))

/**
 * Navigation par mois. Un clic sur le mois ouvre un choix du mois et de l'année (les `<select>`
 * natifs du Vue deviennent des `Select` shadcn) ; chaque choix s'applique aussitôt, « Valider »
 * referme la liste.
 */
export function MonthNavigator({ controller }: MonthNavigatorProps) {
  const { state, marks } = controller
  const [open, setOpen] = useState(false)

  const yearOptions = Array.from(
    { length: marks.currentYear - FIRST_SELECTABLE_YEAR + 1 },
    (_, index) => String(FIRST_SELECTABLE_YEAR + index),
  )

  return (
    <PeriodNavigatorShell
      onPrevious={controller.previousMonth}
      previousLabel="Mois précédent"
      onNext={controller.nextMonth}
      nextLabel="Mois suivant"
      nextDisabled={controller.isCurrentMonth}
      currentLabel="Mois actuel"
      onCurrent={controller.goToCurrentMonth}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
          >
            <span className="font-semibold text-foreground">
              {getMonthName(state.month)} {state.year}
            </span>
            <Calendar className="size-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent sideOffset={8} className="w-auto min-w-[240px] rounded-lg p-3 shadow-lg">
          <div className="mb-3 flex gap-2">
            <Select
              value={String(state.month)}
              onValueChange={(value) => controller.setMonth(Number(value))}
            >
              <SelectTrigger aria-label="Mois" className="flex-1 bg-background">
                <SelectValue />
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
              value={String(state.year)}
              onValueChange={(value) => controller.setYear(Number(value))}
            >
              <SelectTrigger aria-label="Année" className="flex-1 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" size="sm" className="w-full" onClick={() => setOpen(false)}>
            Valider
          </Button>
        </PopoverContent>
      </Popover>
    </PeriodNavigatorShell>
  )
}

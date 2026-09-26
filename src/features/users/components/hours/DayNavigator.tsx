import { useRef } from 'react'
import { CalendarDays } from 'lucide-react'
import type { HoursPeriodController } from '../../hooks/useHoursPeriod'
import { formatDayDisplay, formatDayOfWeek } from '../../lib/hoursPeriod'
import { PeriodNavigatorShell } from './PeriodNavigatorShell'

type DayNavigatorProps = {
  controller: HoursPeriodController
}

/**
 * Navigation par jour. Un clic sur la date ouvre le sélecteur natif (`<input type="date">`
 * invisible). Jour suivant désactivé sur « aujourd'hui », calculé en UTC (B-01 reproduit).
 */
export function DayNavigator({ controller }: DayNavigatorProps) {
  const { state } = controller
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    const input = inputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
      } catch {
        input.focus()
      }
    } else {
      input.focus()
      input.click()
    }
  }

  return (
    <PeriodNavigatorShell
      onPrevious={controller.previousDay}
      previousLabel="Jour précédent"
      onNext={controller.nextDay}
      nextLabel="Jour suivant"
      nextDisabled={controller.isToday}
      currentLabel="Aujourd'hui"
      onCurrent={controller.goToToday}
    >
      <div
        className="relative flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
        onClick={openPicker}
      >
        <span className="font-semibold text-foreground">{formatDayDisplay(state.dateString)}</span>
        <span className="text-sm text-muted-foreground">{formatDayOfWeek(state.dateString)}</span>
        <CalendarDays className="size-3 text-muted-foreground" />
        <input
          ref={inputRef}
          type="date"
          aria-label="Choisir un jour"
          className="absolute inset-0 opacity-0"
          value={state.dateString}
          onChange={(event) => {
            if (event.target.value) controller.setDateString(event.target.value)
          }}
        />
      </div>
    </PeriodNavigatorShell>
  )
}

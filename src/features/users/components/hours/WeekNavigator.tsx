import { CalendarRange } from 'lucide-react'
import type { HoursPeriodController } from '../../hooks/useHoursPeriod'
import { formatWeekRange } from '../../lib/hoursPeriod'
import { PeriodNavigatorShell } from './PeriodNavigatorShell'

type WeekNavigatorProps = {
  controller: HoursPeriodController
}

/**
 * Navigation par semaine ISO. Un `<input type="week">` natif invisible couvre le libellé
 * (sélecteur du navigateur). Comme le Vue, la semaine suivante n'a pas de limite.
 */
export function WeekNavigator({ controller }: WeekNavigatorProps) {
  const { state } = controller

  return (
    <PeriodNavigatorShell
      onPrevious={controller.previousWeek}
      previousLabel="Semaine précédente"
      onNext={controller.nextWeek}
      nextLabel="Semaine suivante"
      currentLabel="Semaine actuelle"
      onCurrent={controller.goToCurrentWeek}
    >
      <div className="relative flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-1 hover:bg-accent">
        <span className="font-semibold text-foreground">
          Semaine {state.week} / {state.year}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatWeekRange(state.year, state.week)}
        </span>
        <CalendarRange className="size-3 text-muted-foreground" />
        <input
          type="week"
          aria-label="Choisir une semaine"
          className="absolute inset-0 cursor-pointer opacity-0"
          value={`${state.year}-W${String(state.week).padStart(2, '0')}`}
          onChange={(event) => {
            const match = /^(\d{4})-W(\d{2})$/.exec(event.target.value)
            if (match) controller.setWeek(Number(match[1]), Number(match[2]))
          }}
        />
      </div>
    </PeriodNavigatorShell>
  )
}

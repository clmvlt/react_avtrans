import { cn } from '@/lib/utils'
import type { PlanningDate } from '../lib/planningDates'

type PlanningDayHeaderCellProps = {
  date: PlanningDate
  /** Plus de 31 jours : initiale du jour, cellule plus basse. */
  compact: boolean
}

/** En-tête d'un jour : aujourd'hui en violet, férié en rouge (●), week-end grisé. */
export function PlanningDayHeaderCell({ date, compact }: PlanningDayHeaderCellProps) {
  const { isToday, isHoliday, isWeekend } = date

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border-l px-0.5',
        compact ? 'min-h-[40px] py-1' : 'min-h-[56px] px-1 py-2',
        isToday && 'bg-primary',
        !isToday && isHoliday && 'bg-destructive/10',
        !isToday && !isHoliday && isWeekend && 'bg-muted/80',
      )}
      title={date.holidayName || date.dateStr}
    >
      <span
        className={cn(
          'leading-tight uppercase',
          compact ? 'text-[9px]' : 'text-xs',
          isToday && 'text-primary-foreground',
          !isToday && isHoliday && 'text-destructive',
          !isToday && !isHoliday && isWeekend && 'text-muted-foreground/60',
          !isToday && !isHoliday && !isWeekend && 'text-muted-foreground',
        )}
      >
        {compact ? date.dayName.charAt(0) : date.dayName}
      </span>
      <span
        className={cn(
          'leading-tight font-bold',
          compact ? 'text-xs' : 'text-base',
          isToday && 'text-primary-foreground',
          !isToday && isHoliday && 'text-destructive',
          !isToday && !isHoliday && isWeekend && 'text-muted-foreground/60',
          !isToday && !isHoliday && !isWeekend && 'text-foreground',
        )}
      >
        {date.dayNumber}
      </span>
      {isHoliday && (
        <span
          className={cn(
            'mt-0.5 text-[6px]',
            isToday ? 'text-primary-foreground' : 'text-destructive',
          )}
        >
          ●
        </span>
      )}
    </div>
  )
}

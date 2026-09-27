import { cn } from '@/lib/utils'
import type { DayAbsentCount } from '../lib/absenceDays'
import { getDayColumnClass } from '../lib/absenceCellStyle'
import type { PlanningDate } from '../lib/planningDates'
import type { PlanningLayout } from '../lib/planningLayout'

type PlanningFooterRowProps = {
  dates: PlanningDate[]
  counts: Map<string, DayAbsentCount>
  layout: PlanningLayout
}

/** Pied collant : nombre d'employés absents chaque jour (jours décomptés, demandes en attente comprises). */
export function PlanningFooterRow({ dates, counts, layout }: PlanningFooterRowProps) {
  return (
    <div
      className="sticky bottom-0 z-20 grid h-8 border-t bg-muted"
      style={{ gridTemplateColumns: layout.template }}
    >
      <div className="sticky left-0 z-10 flex items-center border-r bg-muted px-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:px-3">
        Absents
      </div>
      {dates.map((date, index) => {
        const count = counts.get(date.dateStr)
        const total = count?.total ?? 0
        return (
          <div
            key={date.dateStr}
            className={cn(
              'flex min-w-0 items-center justify-center border-l border-border/60 text-xs font-semibold tabular-nums',
              date.dayOfWeek === 1 && index > 0 && 'border-l-foreground/25',
              getDayColumnClass(date),
              total > 0 ? 'text-foreground' : 'text-muted-foreground/40',
            )}
            title={
              total > 0
                ? `${date.label} : ${total} absent${total > 1 ? 's' : ''}${count?.enAttente ? ` (dont ${count.enAttente} en attente)` : ''}`
                : `${date.label} : aucun absent`
            }
          >
            {total > 0 ? total : '·'}
          </div>
        )
      })}
      <div className="sticky right-0 z-10 border-l bg-muted" />
    </div>
  )
}

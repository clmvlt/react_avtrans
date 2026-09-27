import { cn } from '@/lib/utils'
import { groupMonths, type PlanningDate } from '../lib/planningDates'
import type { PlanningLayout } from '../lib/planningLayout'
import { PlanningDayHeaderCell } from './PlanningDayHeaderCell'

type PlanningHeaderRowsProps = {
  dates: PlanningDate[]
  layout: PlanningLayout
}

const CORNER_CLASS =
  'sticky z-10 flex items-end bg-muted px-2 pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:px-3'

/**
 * En-tête collant de la grille : bandeau des mois quand la période en couvre plusieurs, puis les
 * jours, avec les coins « Employé » et « Total » collés à gauche et à droite.
 */
export function PlanningHeaderRows({ dates, layout }: PlanningHeaderRowsProps) {
  const months = groupMonths(dates)

  return (
    <div className="sticky top-0 z-20 border-b bg-muted">
      {months.length > 1 && (
        <div
          className="grid border-b border-border/60"
          style={{ gridTemplateColumns: layout.template }}
        >
          <div className={cn(CORNER_CLASS, 'left-0 border-r')} />
          {months.map((month) => (
            <div
              key={month.key}
              className="min-w-0 border-l border-foreground/25 py-1 text-xs font-semibold text-foreground"
              style={{ gridColumn: `span ${month.span}` }}
              title={month.label}
            >
              {/* Nom du mois collé contre la colonne des noms pendant le défilement horizontal */}
              <span className="sticky left-[calc(var(--planning-name-col)+0.5rem)] inline-block max-w-full truncate px-2 align-top">
                {month.label}
              </span>
            </div>
          ))}
          <div className={cn(CORNER_CLASS, 'right-0 border-l')} />
        </div>
      )}

      <div
        className={cn('grid', layout.density === 'week' ? 'min-h-14' : 'min-h-10')}
        style={{ gridTemplateColumns: layout.template }}
      >
        <div className={cn(CORNER_CLASS, 'left-0 border-r')}>Employé</div>
        {dates.map((date, index) => (
          <PlanningDayHeaderCell
            key={date.dateStr}
            date={date}
            density={layout.density}
            isFirst={index === 0}
          />
        ))}
        <div className={cn(CORNER_CLASS, 'right-0 justify-end border-l')}>Total</div>
      </div>
    </div>
  )
}

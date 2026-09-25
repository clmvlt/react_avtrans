import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { DayGroup } from '../lib/groupHistoryByDay'
import { ServiceTimeline } from './ServiceTimeline'

type HistoryDayItemProps = {
  day: DayGroup
}

/** Carte d'un jour de l'historique : date, nombre de services, total, frise dépliable. */
export function HistoryDayItem({ day }: HistoryDayItemProps) {
  return (
    <AccordionItem
      value={day.date}
      className="overflow-hidden rounded-xl border bg-card last:border-b"
    >
      <AccordionTrigger className="items-center gap-2 rounded-none px-4 py-3 text-base font-normal transition-colors hover:bg-muted/50 hover:no-underline [&>svg]:translate-y-0">
        {/* Contenu d'un <button> : des <span> en bloc plutôt que <div> / <p> */}
        <span className="block min-w-0 flex-1 pr-1">
          <span className="block truncate font-semibold text-foreground capitalize">
            {day.dayName} {day.dateFormatted}
          </span>
          <span className="block text-xs text-muted-foreground">{day.countLabel}</span>
        </span>
        <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-semibold text-primary tabular-nums">
          {day.totalHours}
        </span>
      </AccordionTrigger>
      <AccordionContent className="border-t px-4 py-1">
        <ServiceTimeline services={day.services} />
      </AccordionContent>
    </AccordionItem>
  )
}

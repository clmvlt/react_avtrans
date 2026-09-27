import { Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ServiceDay } from '../lib/groupServicesByDay'
import { ServiceRow } from './ServiceRow'
import type { ServiceRowHandlers } from './ServiceRowActions'

type ServiceDayCardProps = {
  day: ServiceDay
  handlers: ServiceRowHandlers
  /** « Ajouter un service » prérempli à la date de la journée */
  onAddForDate: (date: string) => void
}

/** Une journée : nom et date, total travaillé, ajout, puis ses services et pauses. */
export function ServiceDayCard({ day, handlers, onAddForDate }: ServiceDayCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-semibold text-foreground capitalize">{day.dayName}</span>
          <span className="text-sm text-muted-foreground">{day.dateFormatted}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1.5 text-sm font-semibold text-primary"
            title="Total travaillé ce jour"
          >
            <Clock className="size-4" />
            <span>{day.totalHours}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`Ajouter un service le ${day.dateFormatted}`}
            onClick={() => onAddForDate(day.date)}
          >
            <Plus className="size-4" />
            Ajouter<span className="max-sm:hidden"> un service</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-2 sm:p-3">
        {day.allServices.map((service) => (
          <ServiceRow key={service.uuid} service={service} handlers={handlers} />
        ))}
      </div>
    </div>
  )
}

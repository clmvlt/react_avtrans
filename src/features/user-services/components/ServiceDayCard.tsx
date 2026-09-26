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
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/50 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground capitalize">{day.dayName}</span>
          <span className="text-sm text-muted-foreground">{day.dateFormatted}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md bg-background px-3 py-1.5 text-sm font-semibold text-primary">
            <Clock className="size-4" />
            <span>{day.totalHours}</span>
          </div>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onAddForDate(day.date)}
          >
            <Plus className="mr-1.5 size-4" />
            Ajouter un service
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {day.allServices.map((service) => (
          <ServiceRow key={service.uuid} service={service} handlers={handlers} />
        ))}
      </div>
    </div>
  )
}

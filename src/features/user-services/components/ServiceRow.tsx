import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDuration, formatTime } from '@/utils/timeFormatters'
import type { ServiceDayItem } from '../lib/groupServicesByDay'
import { DayOffsetBadge } from './DayOffsetBadge'
import { ModifiedBadge } from './ModifiedBadge'
import { ServiceRowActions, type ServiceRowHandlers } from './ServiceRowActions'

type ServiceRowProps = {
  service: ServiceDayItem
  handlers: ServiceRowHandlers
}

const toText = (value: Date | string | undefined) => (value ? String(value) : null)

/** Un service ou une pause : horaires, badges (pause, décalage de jour, en cours, modifié), durée. */
export function ServiceRow({ service, handlers }: ServiceRowProps) {
  const fin = formatTime(toText(service.fin))

  return (
    <div className="flex items-center gap-3 rounded-md p-3 transition-colors hover:bg-muted/50">
      <div
        className={cn(
          'h-8 w-1 shrink-0 rounded-full',
          service.isBreak ? 'bg-amber-500' : 'bg-green-500',
        )}
      />
      <div className="flex flex-1 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
          {service.isBreak && (
            <Badge
              variant="outline"
              className="border-amber-500/50 font-sans text-amber-600 dark:text-amber-400"
            >
              Pause
            </Badge>
          )}
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">{formatTime(toText(service.debut))}</span>
            <DayOffsetBadge label={service.startDayLabel} tooltip={service.startDayTooltip} />
          </span>
          <ArrowRight className="size-3 text-muted-foreground" />
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-foreground">{fin || '--:--'}</span>
            <DayOffsetBadge label={service.endDayLabel} tooltip={service.endDayTooltip} />
          </span>
          {!service.fin && (
            <Badge
              variant="outline"
              className="animate-pulse border-green-500/50 font-sans text-green-600 dark:text-green-400"
            >
              En cours
            </Badge>
          )}
          <ModifiedBadge service={service} onOpenHistory={() => handlers.onHistory(service.uuid)} />
        </div>
        {!!service.duree && (
          <span className="font-mono text-sm text-muted-foreground">
            {formatDuration(service.duree)}
          </span>
        )}
      </div>
      <ServiceRowActions service={service} handlers={handlers} />
    </div>
  )
}

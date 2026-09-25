import { ArrowRight, ClipboardList } from 'lucide-react'
import { Empty, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import type { ServiceDTO } from '@/models'
import { formatDuration } from '@/utils/timeFormatters'
import { toTime } from '../lib/formatters'

type ServiceTimelineProps = {
  services: ServiceDTO[]
  /** UUID du service en cours : sa durée est calculée en direct à partir de `elapsedMs` */
  activeUuid?: string
  elapsedMs?: number
  emptyText?: string
}

/** Frise verticale des services et pauses (ServiceTimeline.vue). */
export function ServiceTimeline({
  services,
  activeUuid,
  elapsedMs = 0,
  emptyText = 'Aucun service enregistré',
}: ServiceTimelineProps) {
  if (!services.length) {
    return (
      <Empty className="gap-2 p-0 py-6 md:p-0 md:py-6">
        <EmptyMedia className="mb-0">
          <ClipboardList className="size-7 text-muted-foreground/70" />
        </EmptyMedia>
        <EmptyDescription className="text-sm">{emptyText}</EmptyDescription>
      </Empty>
    )
  }

  const isActive = (service: ServiceDTO) => !!activeUuid && service.uuid === activeUuid

  const durationOf = (service: ServiceDTO) => {
    if (service.fin) return formatDuration(service.duree || 0)
    if (isActive(service)) return formatDuration(Math.floor(elapsedMs / 1000))
    return '--'
  }

  return (
    <ol className="relative ml-1.5 border-l border-border pl-5">
      {services.map((service, index) => (
        <li key={service.uuid ?? index} className="relative py-2.5">
          {/* Point sur la frise */}
          <span
            className={cn(
              'absolute top-[1.05rem] left-[calc(-1.25rem_-_5.5px)] size-2.5 rounded-full ring-4 ring-card',
              service.isBreak ? 'bg-amber-500' : 'bg-green-500',
              isActive(service) && 'animate-pulse',
            )}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground tabular-nums">
                <span>{toTime(service.debut)}</span>
                <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                {service.fin ? (
                  <span>{toTime(service.fin)}</span>
                ) : (
                  <span className="text-xs font-normal text-muted-foreground italic">en cours</span>
                )}
              </div>
              <p
                className={cn(
                  'text-xs',
                  service.isBreak ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                )}
              >
                {service.isBreak ? 'Pause' : 'Service'}
              </p>
            </div>

            {/* Bug B-32 reproduit : la durée d'une pause en cours s'affiche en vert (couleur « service ») */}
            <span
              className={cn(
                'shrink-0 font-mono text-sm tabular-nums',
                isActive(service)
                  ? 'font-semibold text-green-600 dark:text-green-400'
                  : 'text-muted-foreground',
              )}
            >
              {durationOf(service)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

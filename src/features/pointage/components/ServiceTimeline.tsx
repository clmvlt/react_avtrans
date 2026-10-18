import { ArrowRight, ClipboardList } from 'lucide-react'
import { Empty, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { isLineRunning, liveLineSeconds } from '@/lib/liveCounter'
import { startDayKey } from '@/lib/serviceLines'
import { cn } from '@/lib/utils'
import type { ServiceDTO } from '@/models'
import { formatTimeInWorkday } from '@/lib/workday'
import { formatDuration } from '@/utils/timeFormatters'

type ServiceTimelineProps = {
  /** Services et pauses, dans l'ordre d'affichage */
  lines: ServiceDTO[]
  /** Secondes écoulées depuis la réception : les lignes en cours avancent d'autant */
  elapsed?: number
  emptyText?: string
  /**
   * Jour de la journée affichée (`YYYY-MM-DD`) : une heure qui tombe un autre jour (fin d'un
   * service de nuit) est suivie de son jour, « 06:00 (mar. 13/10) »
   */
  dayKey?: string
}

const sameDay = (a: ServiceDTO['debut'], b: ServiceDTO['fin']) =>
  !!a && !!b && new Date(a).toDateString() === new Date(b).toDateString()

/**
 * Frise verticale des services et pauses (ServiceTimeline.vue). Durée d'un service = temps net
 * (`dureeTravail`), d'une pause = `duree`, calculées par l'API et en direct pour une ligne en cours.
 */
export function ServiceTimeline({
  lines,
  elapsed = 0,
  emptyText = 'Aucun service enregistré',
  dayKey,
}: ServiceTimelineProps) {
  if (!lines.length) {
    return (
      <Empty className="gap-2 p-0 py-6 md:p-0 md:py-6">
        <EmptyMedia className="mb-0">
          <ClipboardList className="size-7 text-muted-foreground/70" />
        </EmptyMedia>
        <EmptyDescription className="text-sm">{emptyText}</EmptyDescription>
      </Empty>
    )
  }

  return (
    <ol className="relative ml-1.5 border-l border-border pl-5">
      {lines.map((service, index) => (
        <li key={service.uuid ?? index} className="relative py-2.5">
          {/* Point sur la frise */}
          <span
            className={cn(
              'absolute top-[1.05rem] left-[calc(-1.25rem_-_5.5px)] size-2.5 rounded-full ring-4 ring-card',
              service.isBreak ? 'bg-amber-500' : 'bg-green-500',
              isLineRunning(service) && 'animate-pulse',
            )}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-1.5 text-sm font-medium text-foreground tabular-nums">
                {/* Début et fin le même jour hors journée (pause après minuit) : le jour une seule fois */}
                <span>
                  {formatTimeInWorkday(
                    service.debut,
                    service.fin && sameDay(service.debut, service.fin)
                      ? (startDayKey(service) ?? dayKey)
                      : dayKey,
                  )}
                </span>
                <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                {service.fin ? (
                  <span>{formatTimeInWorkday(service.fin, dayKey)}</span>
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
                isLineRunning(service)
                  ? 'font-semibold text-green-600 dark:text-green-400'
                  : 'text-muted-foreground',
              )}
            >
              {formatDuration(liveLineSeconds(service, elapsed))}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

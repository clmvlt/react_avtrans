import type { ReactNode } from 'react'
import { Gauge, MapPinOff } from 'lucide-react'
import { useDayKey } from '@/hooks/useDayChange'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { parseLocalDateKey } from '@/lib/dates'
import { isLineRunning, liveDurations, type Received } from '@/lib/liveCounter'
import { formatSince, startDayKey } from '@/lib/serviceLines'
import { cn } from '@/lib/utils'
import { formatTimeInWorkday, formatWorkdayTitle } from '@/lib/workday'
import type { ServiceDTO } from '@/models'
import { formatDuration } from '@/utils/timeFormatters'
import { isWorkdayRunning, workdayTotalSeconds, type DailyWorkday } from '../lib/dailyWorkday'
import { formatTodayLabel } from '../lib/formatters'
import { HERO_CLASS_NAME, getPointageStatus } from '../lib/pointageStatus'
import { currentWorkSegment, formatClock } from '../lib/workedTime'
import { StatusPill } from './StatusPill'

type StatusHeroCardProps = {
  /** Service de travail en cours (avec ses pauses), `null` hors service */
  active: Received<ServiceDTO | null>
  /** Journée de travail en cours : son temps net et son dernier service terminé, hors service */
  workday: DailyWorkday
  /** Permission de géolocalisation refusée : puce « Localisation refusée · Réessayer » */
  locationDenied: boolean
  onRetryLocation: () => void
  /** Rôle Utilisateur sans kilométrage saisi aujourd'hui : puce de rappel */
  showKilometrageReminder: boolean
  onOpenKilometrage: () => void
  /** Actions de pointage, affichées à partir de `md` (barre fixe en bas en dessous) */
  children: ReactNode
}

const chipClassName =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors'

/**
 * Carte d'état. En service : temps de travail net du service en cours (`dureeTravail`, en direct),
 * même s'il a commencé la veille (signalé dans l'en-tête), avec le segment ou la pause en cours en
 * sous-titre. Hors service : temps net de la journée de travail selon l'API (celle de la veille,
 * annoncée comme telle, après un service de nuit). Puis pastille, rappels et actions.
 */
export function StatusHeroCard({
  active,
  workday,
  locationDenied,
  onRetryLocation,
  showKilometrageReminder,
  onOpenKilometrage,
  children,
}: StatusHeroCardProps) {
  const service = active.data
  const status = getPointageStatus(service)
  const todayKey = useDayKey()
  const todayLabel = formatTodayLabel(parseLocalDateKey(todayKey) ?? new Date())
  const serviceElapsed = useLiveElapsed(active.receivedAt, !!service && isLineRunning(service))
  const dayElapsed = useLiveElapsed(workday.receivedAt, !service && isWorkdayRunning(workday))
  const durations = service ? liveDurations(service, serviceElapsed) : null

  const clock = formatClock(
    durations ? durations.dureeTravail : workdayTotalSeconds(workday, dayElapsed),
  )

  const heading =
    service && startDayKey(service) !== todayKey ? (
      `Service en cours depuis ${formatSince(service.debut, todayKey)}`
    ) : !service && !workday.aujourdhui ? (
      formatWorkdayTitle(workday.date, false)
    ) : (
      <>
        {service ? 'Service en cours' : "Aujourd'hui"} ·{' '}
        <span className="capitalize">{todayLabel}</span>
      </>
    )

  const subtitle = (() => {
    if (service && durations?.pause) {
      return `En pause depuis ${formatSince(durations.pause.debut, todayKey)} · ${formatDuration(durations.dureePause)}`
    }
    if (service && durations) {
      const segment = currentWorkSegment(service, durations)
      return `En service depuis ${formatSince(segment.start, todayKey)} · ${formatDuration(segment.seconds)}`
    }
    const lastEnded = [...workday.services].reverse().find((s) => !s.isBreak && s.fin)
    return lastEnded
      ? `Dernier service terminé à ${formatTimeInWorkday(lastEnded.fin, workday.date)}`
      : 'Aucun service en cours'
  })()

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-colors sm:p-6',
        HERO_CLASS_NAME[status],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {heading}
          </p>
          <p className="mt-2 font-mono text-4xl leading-none font-bold text-foreground tabular-nums sm:text-5xl">
            {clock}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          {durations && durations.dureePauses > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pauses déduites : {formatDuration(durations.dureePauses)}
            </p>
          )}
        </div>
        <StatusPill status={status} />
      </div>

      {(locationDenied || showKilometrageReminder) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {locationDenied && (
            <button
              type="button"
              className={cn(
                chipClassName,
                'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15',
              )}
              onClick={onRetryLocation}
            >
              <MapPinOff className="size-3.5" />
              Localisation refusée · Réessayer
            </button>
          )}
          {showKilometrageReminder && (
            <button
              type="button"
              className={cn(
                chipClassName,
                'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15',
              )}
              onClick={onOpenKilometrage}
            >
              <Gauge className="size-3.5" />
              Kilométrage du jour à saisir
            </button>
          )}
        </div>
      )}

      {/* Actions sur PC uniquement : sur mobile, elles sont dans la barre fixe en bas */}
      <div className="mt-5 hidden md:block">{children}</div>
    </section>
  )
}

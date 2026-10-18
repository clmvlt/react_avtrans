import { Clock } from 'lucide-react'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { hasRunningLine } from '@/lib/serviceLines'
import { formatWorkdayTitle } from '@/lib/workday'
import {
  formatWorkdayTotal,
  isWorkdayRunning,
  workdayLines,
  workdayTotalSeconds,
  type DailyWorkday,
} from '../lib/dailyWorkday'
import { countLabel } from '../lib/formatters'
import { ServiceTimeline } from './ServiceTimeline'

type TodayServicesCardProps = {
  /** Journée de travail en cours (la veille pour un service de nuit) */
  today: DailyWorkday
}

/**
 * Carte de la journée de travail : « Aujourd'hui », ou « Journée du lundi 12/10 (service de nuit) »
 * après minuit pour un service commencé la veille. Frise des services et de leurs pauses (une heure
 * du lendemain porte son jour) et temps net de la journée selon l'API, en direct.
 */
export function TodayServicesCard({ today }: TodayServicesCardProps) {
  const lines = workdayLines(today)
  const elapsed = useLiveElapsed(today.receivedAt, isWorkdayRunning(today) || hasRunningLine(lines))
  const total = workdayTotalSeconds(today, elapsed)
  const count = countLabel(lines)

  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            {formatWorkdayTitle(today.date, today.aujourdhui)}
          </h2>
          {count && <p className="text-xs text-muted-foreground">{count}</p>}
        </div>
        {lines.length > 0 && (
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 font-mono text-sm font-semibold text-foreground tabular-nums"
            title="Temps de travail net de la journée, pauses déduites"
          >
            <Clock className="size-4 text-muted-foreground" />
            {formatWorkdayTotal(total)}
          </span>
        )}
      </div>
      <div className="px-4 py-2 sm:px-5">
        <ServiceTimeline
          lines={lines}
          elapsed={elapsed}
          dayKey={today.date || undefined}
          emptyText="Aucun service enregistré aujourd'hui"
        />
      </div>
    </section>
  )
}

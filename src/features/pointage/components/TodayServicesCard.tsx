import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import type { Received } from '@/lib/liveCounter'
import { hasRunningLine, withPauses } from '@/lib/serviceLines'
import type { ServiceDTO } from '@/models'
import { countLabel } from '../lib/formatters'
import { ServiceTimeline } from './ServiceTimeline'

type TodayServicesCardProps = {
  /** Services de travail du jour, pauses imbriquées */
  today: Received<ServiceDTO[]>
}

/** Carte « Services du jour » : frise des services et de leurs pauses, durées en direct. */
export function TodayServicesCard({ today }: TodayServicesCardProps) {
  const lines = withPauses(today.data)
  const elapsed = useLiveElapsed(today.receivedAt, hasRunningLine(lines))

  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-foreground">Services du jour</h2>
        <span className="text-xs text-muted-foreground">{countLabel(lines)}</span>
      </div>
      <div className="px-4 py-2 sm:px-5">
        <ServiceTimeline
          lines={lines}
          elapsed={elapsed}
          emptyText="Aucun service enregistré aujourd'hui"
        />
      </div>
    </section>
  )
}

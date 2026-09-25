import type { ServiceDTO } from '@/models'
import { useElapsedMs } from '../hooks/useElapsedMs'
import { countLabel } from '../lib/formatters'
import { ServiceTimeline } from './ServiceTimeline'

type TodayServicesCardProps = {
  services: ServiceDTO[]
  activeService: ServiceDTO | null
}

/** Carte « Services du jour » : frise avec la durée du service en cours en direct. */
export function TodayServicesCard({ services, activeService }: TodayServicesCardProps) {
  const elapsedMs = useElapsedMs(activeService)

  return (
    <section className="rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-foreground">Services du jour</h2>
        <span className="text-xs text-muted-foreground">{countLabel(services)}</span>
      </div>
      <div className="px-4 py-2 sm:px-5">
        <ServiceTimeline
          services={services}
          activeUuid={activeService?.uuid}
          elapsedMs={elapsedMs}
          emptyText="Aucun service enregistré aujourd'hui"
        />
      </div>
    </section>
  )
}

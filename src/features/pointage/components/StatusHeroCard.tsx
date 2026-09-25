import { useState, type ReactNode } from 'react'
import { Gauge, MapPinOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServiceDTO } from '@/models'
import { formatDuration } from '@/utils/timeFormatters'
import { useElapsedMs } from '../hooks/useElapsedMs'
import { formatTodayLabel, toTime } from '../lib/formatters'
import { HERO_CLASS_NAME, getPointageStatus } from '../lib/pointageStatus'
import { computeTodayWorkedMs, formatClock } from '../lib/workedTime'
import { StatusPill } from './StatusPill'

type StatusHeroCardProps = {
  activeService: ServiceDTO | null
  todayServices: ServiceDTO[]
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

/** Carte d'état : chrono du jour en direct, sous-titre, pastille, rappels et actions (PC). */
export function StatusHeroCard({
  activeService,
  todayServices,
  locationDenied,
  onRetryLocation,
  showKilometrageReminder,
  onOpenKilometrage,
  children,
}: StatusHeroCardProps) {
  const elapsedMs = useElapsedMs(activeService)
  // Calculée une fois au montage, comme le `computed` sans dépendance du Vue
  const [todayLabel] = useState(() => formatTodayLabel(new Date()))
  const status = getPointageStatus(activeService)
  const clock = formatClock(computeTodayWorkedMs(todayServices, activeService, elapsedMs))

  const subtitle = (() => {
    const since = toTime(activeService?.debut)
    const elapsed = formatDuration(Math.floor(elapsedMs / 1000))
    if (status === 'working') return `En service depuis ${since} · ${elapsed}`
    if (status === 'break') return `En pause depuis ${since} · ${elapsed}`
    const lastEnded = [...todayServices].reverse().find((s) => !s.isBreak && s.fin)
    return lastEnded
      ? `Dernier service terminé à ${toTime(lastEnded.fin)}`
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
            Aujourd&apos;hui · <span className="capitalize">{todayLabel}</span>
          </p>
          <p className="mt-2 font-mono text-4xl leading-none font-bold text-foreground tabular-nums sm:text-5xl">
            {clock}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
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

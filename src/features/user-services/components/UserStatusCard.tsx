import { useId } from 'react'
import { LoaderCircle, Pause, Play, Square } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDayKey } from '@/hooks/useDayChange'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { isLineRunning, liveDurations } from '@/lib/liveCounter'
import { formatSince } from '@/lib/serviceLines'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/timeFormatters'
import {
  getStatusBadgeClass,
  getStatusDotClass,
  getStatusText,
  type AdminUserStatusInfo,
} from '../lib/serviceStatus'

type UserStatusCardProps = {
  statusInfo: AdminUserStatusInfo
  /** Action en cours : boutons désactivés avec spinner */
  isPending: boolean
  onStartService: () => void
  onStartBreak: () => void
  onEndService: () => void
  onEndBreak: () => void
}

/**
 * Statut actuel de l'employé et boutons pour pointer à sa place (pleine largeur sur téléphone).
 * En service : début du service (avec sa date s'il a commencé un autre jour) et temps de travail
 * net ; en pause : début et durée de la pause. Les durées viennent de l'API et avancent en direct
 * (D12 ; B-26 : elles restaient figées).
 */
export function UserStatusCard({
  statusInfo,
  isPending,
  onStartService,
  onStartBreak,
  onEndService,
  onEndBreak,
}: UserStatusCardProps) {
  const titleId = useId()
  const { status, service, pause, receivedAt } = statusInfo
  const todayKey = useDayKey()
  const elapsed = useLiveElapsed(receivedAt, !!service && isLineRunning(service))
  const durations = service ? liveDurations(service, elapsed) : null
  const spinner = <LoaderCircle className="size-4 animate-spin" />

  return (
    <section aria-labelledby={titleId} className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 id={titleId} className="text-sm font-semibold text-foreground">
            Statut actuel
          </h2>
          <Badge
            variant={status === 'ABSENT' ? 'secondary' : 'outline'}
            className={getStatusBadgeClass(status)}
          >
            <span
              className={cn('mr-1 inline-block size-2 rounded-full', getStatusDotClass(status))}
            />
            {getStatusText(status)}
          </Badge>
        </div>
        {service && durations && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {pause ? (
              <Pause className="size-4 text-amber-500" />
            ) : (
              <Play className="size-4 text-green-500" />
            )}
            <span>
              {pause ? 'En pause depuis' : 'Depuis'}{' '}
              {formatSince(pause ? pause.debut : service.debut, todayKey)}
            </span>
            <span
              className="rounded-md bg-muted px-2 py-0.5 font-mono font-medium tabular-nums"
              title={pause ? 'Durée de la pause' : 'Temps de travail net, pauses déduites'}
            >
              {formatDuration(pause ? durations.dureePause : durations.dureeTravail)}
            </span>
          </div>
        )}
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Ces boutons pointent à la place de l&apos;employé.
      </p>

      <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {status === 'ABSENT' && (
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={onStartService}
            disabled={isPending}
          >
            {isPending ? spinner : <Play className="size-4" />}
            Démarrer le service
          </Button>
        )}

        {status === 'PRESENT' && (
          <>
            <Button
              className="bg-amber-500 text-white hover:bg-amber-600"
              onClick={onStartBreak}
              disabled={isPending}
            >
              {isPending ? spinner : <Pause className="size-4" />}
              Démarrer une pause
            </Button>
            <Button variant="destructive" onClick={onEndService} disabled={isPending}>
              {isPending ? spinner : <Square className="size-4" />}
              Terminer le service
            </Button>
          </>
        )}

        {status === 'ON_BREAK' && (
          <Button
            className="bg-amber-500 text-white hover:bg-amber-600"
            onClick={onEndBreak}
            disabled={isPending}
          >
            {isPending ? spinner : <Play className="size-4" />}
            Terminer la pause
          </Button>
        )}
      </div>
    </section>
  )
}

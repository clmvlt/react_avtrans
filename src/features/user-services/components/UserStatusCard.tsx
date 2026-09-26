import { LoaderCircle, Pause, Play, Square } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { calculateDuration, formatTime } from '@/utils/timeFormatters'
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
 * Statut actuel de l'employé et boutons pour pointer à sa place.
 * Bug B-26 reproduit : la durée du pointage en cours est calculée au rendu, sans minuterie
 * (elle reste figée tant que la carte n'est pas redessinée).
 */
export function UserStatusCard({
  statusInfo,
  isPending,
  onStartService,
  onStartBreak,
  onEndService,
  onEndBreak,
}: UserStatusCardProps) {
  const { status, activeServiceStart } = statusInfo
  const spinner = <LoaderCircle className="mr-2 size-4 animate-spin" />

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Statut actuel</span>
          <Badge
            variant={status === 'ABSENT' ? 'secondary' : 'outline'}
            className={getStatusBadgeClass(status)}
          >
            <span
              className={cn('mr-2 inline-block size-2 rounded-full', getStatusDotClass(status))}
            />
            {getStatusText(status)}
          </Badge>
        </div>
        {activeServiceStart && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Play className="size-4 text-green-500" />
            <span>Depuis {formatTime(activeServiceStart)}</span>
            <span className="rounded bg-muted px-2 py-0.5 font-mono font-medium">
              {calculateDuration(activeServiceStart)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {status === 'ABSENT' && (
          <Button
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={onStartService}
            disabled={isPending}
          >
            {isPending ? spinner : <Play className="mr-2 size-4" />}
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
              {isPending ? spinner : <Pause className="mr-2 size-4" />}
              Démarrer une pause
            </Button>
            <Button variant="destructive" onClick={onEndService} disabled={isPending}>
              {isPending ? spinner : <Square className="mr-2 size-4" />}
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
            {isPending ? spinner : <Play className="mr-2 size-4" />}
            Terminer la pause
          </Button>
        )}
      </div>
    </div>
  )
}

import { ChevronRight, LoaderCircle, Pause, Play, Square, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ServiceTimeline } from '@/features/pointage/components/ServiceTimeline'
import { adminServicesKeys } from '@/features/user-services/api/queryKeys'
import { useUserActiveServiceQuery } from '@/features/user-services/api/useUserActiveServiceQuery'
import { useUserServicesRangeQuery } from '@/features/user-services/api/useUserServicesRangeQuery'
import { useUserWorkedHoursQuery } from '@/features/user-services/api/useUserWorkedHoursQuery'
import { useAdminServiceActions } from '@/features/user-services/hooks/useAdminServiceActions'
import { ABSENT_STATUS } from '@/features/user-services/lib/serviceStatus'
import { useDayKey, useInvalidateOnDayChange } from '@/hooks/useDayChange'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { parseLocalDateKey } from '@/lib/dates'
import { isLineRunning, isPeriodRunning, liveDurations, livePeriodSeconds } from '@/lib/liveCounter'
import { formatSince, hasRunningLine, startDayKey } from '@/lib/serviceLines'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/timeFormatters'
import { formatClock } from '../lib/formatters'
import { PRESENCE_DOT_CLASSES, PRESENCE_LABELS } from '../lib/presence'
import { HubCard } from './HubCard'

/** Toutes les heures travaillées (même clé que les pointages d'un employé). */
const ALL_HOURS_PARAMS = {}

const TONES = {
  PRESENT: 'border-success/30 bg-success/5',
  ON_BREAK: 'border-warning/40 bg-warning/5',
  ABSENT: 'border-border bg-muted/40',
} as const

type TodayCardProps = {
  userUuid: string
  /** « Pointages » : ouvre l'onglet des pointages */
  onShowServices: () => void
  /** Après une action de pointage réussie */
  onActionDone: () => void
}

/**
 * Journée de l'employé : présence, heures nettes du jour qui avancent en direct, boutons pour
 * pointer à sa place (mêmes actions que ses pointages) et frise des pointages du jour.
 */
export function TodayCard({ userUuid, onShowServices, onActionDone }: TodayCardProps) {
  const todayKey = useDayKey()
  const statusQuery = useUserActiveServiceQuery(userUuid)
  const statusInfo = statusQuery.data ?? ABSENT_STATUS
  const actions = useAdminServiceActions(userUuid, statusInfo, onActionDone)
  const hoursQuery = useUserWorkedHoursQuery(userUuid, ALL_HOURS_PARAMS)
  useInvalidateOnDayChange(adminServicesKeys.userHours(userUuid))
  const todayQuery = useUserServicesRangeQuery(userUuid, todayKey, todayKey)

  const { status, service, pause } = statusInfo
  const hoursDay = hoursQuery.data?.data.day
  const lines = todayQuery.data?.lines ?? []

  const hoursElapsed = useLiveElapsed(hoursQuery.data?.receivedAt, isPeriodRunning(hoursDay))
  const serviceElapsed = useLiveElapsed(statusInfo.receivedAt, !!service && isLineRunning(service))
  const linesElapsed = useLiveElapsed(todayQuery.data?.receivedAt, hasRunningLine(lines))

  const durations = service ? liveDurations(service, serviceElapsed) : null
  // Service de nuit commencé la veille : il compte sur la veille, pas dans « aujourd'hui » (D12)
  const startedEarlier = !!service && startDayKey(service) !== todayKey
  const spinner = <LoaderCircle className="size-4 animate-spin" />
  const dateLabel = parseLocalDateKey(todayKey)?.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <HubCard
      title="Aujourd'hui"
      description={<span className="capitalize">{dateLabel}</span>}
      icon={Sun}
      actions={
        <Button variant="ghost" size="sm" onClick={onShowServices}>
          Pointages
          <ChevronRight className="size-4" />
        </Button>
      }
    >
      <div className={cn('rounded-lg border p-3 sm:p-4', TONES[status])}>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className={cn('size-2.5 rounded-full', PRESENCE_DOT_CLASSES[status])} />
            {PRESENCE_LABELS[status]}
          </span>
          {service && (
            <span className="truncate text-xs text-muted-foreground">
              depuis {formatSince(pause ? pause.debut : service.debut, todayKey)}
            </span>
          )}
        </div>
        <p
          className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground tabular-nums"
          aria-live="off"
        >
          {formatClock(livePeriodSeconds(hoursDay, hoursElapsed))}
        </p>
        <p className="text-xs text-muted-foreground">travaillé aujourd&apos;hui, pauses déduites</p>
        {durations && (pause || startedEarlier) && (
          <div className="mt-2 flex flex-col gap-0.5 border-t pt-2 text-xs">
            {pause && (
              <span className="text-warning">
                Pause en cours : {formatDuration(durations.dureePause)}
              </span>
            )}
            {startedEarlier && (
              <span className="text-muted-foreground">
                Service commencé {formatSince(service.debut, todayKey)} :{' '}
                {formatDuration(durations.dureeTravail)} de travail
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {status === 'ABSENT' && (
          <Button
            className="col-span-2 bg-success text-success-foreground hover:bg-success/90"
            onClick={actions.startService}
            disabled={actions.isPending}
          >
            {actions.isPending ? spinner : <Play className="size-4" />}
            Démarrer le service
          </Button>
        )}
        {status === 'PRESENT' && (
          <>
            <Button
              className="bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={actions.startBreak}
              disabled={actions.isPending}
            >
              {actions.isPending ? spinner : <Pause className="size-4" />}
              Pause
            </Button>
            <Button variant="destructive" onClick={actions.endService} disabled={actions.isPending}>
              {actions.isPending ? spinner : <Square className="size-4" />}
              Terminer
            </Button>
          </>
        )}
        {status === 'ON_BREAK' && (
          <Button
            className="col-span-2 bg-warning text-warning-foreground hover:bg-warning/90"
            onClick={actions.endBreak}
            disabled={actions.isPending}
          >
            {actions.isPending ? spinner : <Play className="size-4" />}
            Terminer la pause
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Ces boutons pointent à la place de l&apos;employé, à l&apos;heure actuelle.
      </p>

      <div className="mt-4 border-t pt-2">
        <ServiceTimeline
          lines={lines}
          elapsed={linesElapsed}
          emptyText="Aucun pointage aujourd'hui"
        />
      </div>
    </HubCard>
  )
}

import { Link } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/userInitials'
import { useDayKey } from '@/hooks/useDayChange'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import {
  currentPause,
  isLineRunning,
  isPeriodRunning,
  liveLineSeconds,
  livePeriodHours,
} from '@/lib/liveCounter'
import { formatSince, startDayKey } from '@/lib/serviceLines'
import { cn } from '@/lib/utils'
import type { UserWithStatusDTO } from '@/models'
import type { MonitoringActions } from '../hooks/useMonitoringActions'
import { formatHoursToday } from '../lib/groupByPresence'
import { PresenceUserContextMenu } from './PresenceUserContextMenu'
import { PresenceUserDropdown } from './PresenceUserDropdown'

export type PresenceColor = 'green' | 'amber' | 'gray'

const DOT_CLASSES: Record<PresenceColor, string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  gray: 'bg-muted-foreground/50',
}

function getStatusText(status: UserWithStatusDTO['status']) {
  switch (status) {
    case 'PRESENT':
      return { label: 'Présent', className: 'text-green-600 dark:text-green-400' }
    case 'ON_BREAK':
      return { label: 'En pause', className: 'text-amber-600 dark:text-amber-400' }
    default:
      return { label: 'Absent', className: 'text-muted-foreground' }
  }
}

type PresenceUserCardProps = {
  user: UserWithStatusDTO
  /** Réception de la liste (`performance.now()`) : base des compteurs en direct */
  receivedAt: number
  color: PresenceColor
  actions: MonitoringActions
}

/**
 * Carte d'un employé : lien vers ses pointages, avatar avec pastille de présence, heure de début
 * (du service, ou de la pause en cours) et heures nettes du jour (aussi sur téléphone) ; menu
 * « ⋮ » et clic droit. Les heures avancent en direct entre deux rafraîchissements (D12). Un service
 * commencé un autre jour (service de nuit) ne compte pas dans les heures du jour : son temps net
 * s'affiche à part.
 */
export function PresenceUserCard({ user, receivedAt, color, actions }: PresenceUserCardProps) {
  const statusText = getStatusText(user.status)
  const todayKey = useDayKey()
  const service = user.status !== 'ABSENT' ? (user.activeService ?? null) : null
  const pause = user.status === 'ON_BREAK' ? currentPause(service) : null
  const start = pause?.debut ?? service?.debut
  const running = isPeriodRunning(user.hoursToday) || (!!service && isLineRunning(service))
  const elapsed = useLiveElapsed(receivedAt, running)
  const hoursToday = livePeriodHours(user.hoursToday, elapsed)
  const nightService = !!service && startDayKey(service) !== todayKey
  const serviceHours = service && nightService ? liveLineSeconds(service, elapsed) / 3600 : 0

  return (
    <PresenceUserContextMenu user={user} actions={actions}>
      <div className="group relative animate-in duration-200 fade-in-0 zoom-in-95">
        <Link
          to={`/users/${user.uuid}/services`}
          className="flex h-full flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:gap-3 md:p-4"
        >
          <div className="relative">
            <Avatar className="size-12 shrink-0 bg-muted md:size-14">
              {user.pictureUrl && (
                <AvatarImage src={user.pictureUrl} alt={user.firstName} className="object-cover" />
              )}
              <AvatarFallback
                delayMs={user.pictureUrl ? 600 : undefined}
                className="bg-primary text-sm font-semibold text-primary-foreground md:text-base"
              >
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card md:size-3.5',
                DOT_CLASSES[color],
              )}
            />
          </div>

          <div className="w-full min-w-0">
            <p className="truncate text-sm font-medium text-foreground md:text-base">
              {user.firstName}
            </p>
            <p className="truncate text-xs text-muted-foreground md:text-sm">{user.lastName}</p>
          </div>

          <div className="w-full text-xs text-muted-foreground">
            <span className={statusText.className}>{statusText.label}</span>
            {start && <span> · {formatSince(start, todayKey)}</span>}
          </div>

          {hoursToday > 0 && (
            <div className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {formatHoursToday(hoursToday)}
            </div>
          )}
          {serviceHours > 0 && (
            <div className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              Service en cours : {formatHoursToday(serviceHours)}
            </div>
          )}
        </Link>

        <PresenceUserDropdown user={user} actions={actions} />
      </div>
    </PresenceUserContextMenu>
  )
}

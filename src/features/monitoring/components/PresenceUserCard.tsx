import { Link } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/userInitials'
import { cn } from '@/lib/utils'
import type { UserWithStatusDTO } from '@/models'
import { formatTime } from '@/utils/timeFormatters'
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
  color: PresenceColor
  actions: MonitoringActions
}

/**
 * Carte d'un employé : lien vers ses pointages, avatar avec pastille de présence, heure de début
 * et heures du jour ; menu « ⋮ » et clic droit.
 */
export function PresenceUserCard({ user, color, actions }: PresenceUserCardProps) {
  const statusText = getStatusText(user.status)
  const start = user.status !== 'ABSENT' ? user.activeService?.debut : undefined

  return (
    <PresenceUserContextMenu user={user} actions={actions}>
      <div className="group relative animate-in duration-200 fade-in-0 zoom-in-95">
        <Link
          to={`/users/${user.uuid}/services`}
          className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-center transition-all hover:shadow-md md:gap-3 md:p-4"
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
            {start && <span className="hidden sm:inline"> · {formatTime(start)}</span>}
          </div>

          {user.hoursToday !== undefined && user.hoursToday > 0 && (
            <div className="hidden rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground sm:block">
              {formatHoursToday(user.hoursToday)}
            </div>
          )}
        </Link>

        <PresenceUserDropdown user={user} actions={actions} />
      </div>
    </PresenceUserContextMenu>
  )
}

import type { KeyboardEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { useNow } from '@/hooks/useNow'
import { cn } from '@/lib/utils'
import type { NotificationDTO } from '@/models'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { getNotificationMeta } from '../lib/notificationMeta'

type NotificationItemProps = {
  notification: NotificationDTO
  onSelect: (notification: NotificationDTO) => void
}

/** Ligne de la liste du popover (non lue : liseré et fond primaires, pastille). */
export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  // Ancienneté tenue à jour tant que la liste est ouverte
  const now = useNow()
  const meta = getNotificationMeta(notification.refType)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(notification)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer gap-3 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-accent',
        !notification.isRead && 'border-l-[3px] border-l-primary bg-primary/5 hover:bg-primary/10',
      )}
      onClick={() => onSelect(notification)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
        <meta.icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm leading-tight font-semibold text-foreground">
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{notification.description}</p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground/70">
            {formatRelativeTime(notification.createdAt, { now })}
          </span>
          {notification.refType && (
            <Badge variant="outline" className="text-[10px]">
              {meta.label}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

import type { KeyboardEvent } from 'react'
import { Check, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NotificationDTO } from '@/models'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { getNotificationMeta } from '../lib/notificationMeta'

type NotificationCardProps = {
  notification: NotificationDTO
  /**
   * Bouton « Marquer comme lu » (onglets « Toutes » et « Non lues ») ; il n'apparaît que pour
   * une notification non lue. L'onglet « Lues » ne l'a pas, comme dans le Vue.
   */
  showActions?: boolean
  /** Marquage de cette notification en cours */
  isMarking?: boolean
  onOpen: (notification: NotificationDTO) => void
  onMarkRead: (notification: NotificationDTO) => void
}

/**
 * Carte d'une notification de la page /notifications (non lue : liseré et pastille primaires).
 * Présentation plus riche que la ligne du popover (`NotificationItem`) : pastille d'icône colorée
 * par type, date relative longue, bouton « Marquer comme lu ».
 */
export function NotificationCard({
  notification,
  showActions = true,
  isMarking = false,
  onOpen,
  onMarkRead,
}: NotificationCardProps) {
  const meta = getNotificationMeta(notification.refType)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Entrée / Espace sur « Marquer comme lu » ne doit pas ouvrir la notification
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen(notification)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:gap-4',
        !notification.isRead && 'border-l-4 border-l-primary bg-primary/[0.02]',
      )}
      onClick={() => onOpen(notification)}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg border sm:size-12',
          meta.iconClassName,
        )}
      >
        <meta.icon className="size-5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm leading-snug font-semibold text-foreground">
            {notification.title}
          </h3>
          {!notification.isRead && (
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{notification.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <Clock className="size-3" />
            {formatRelativeTime(notification.createdAt, { style: 'long' })}
          </span>
          {notification.refType && (
            <Badge variant="outline" className="text-xs">
              {meta.label}
            </Badge>
          )}
        </div>
      </div>

      {showActions && !notification.isRead && (
        // Libellé visible dès `sm` ; icône seule (36 px) sur téléphone
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 self-start max-sm:size-9 max-sm:px-0"
          title="Marquer comme lu"
          disabled={isMarking}
          onClick={(event) => {
            event.stopPropagation()
            onMarkRead(notification)
          }}
        >
          <Check className="size-4" />
          <span className="max-sm:sr-only">Marquer comme lu</span>
        </Button>
      )}
    </div>
  )
}

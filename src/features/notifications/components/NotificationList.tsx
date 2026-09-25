import { Inbox } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { NotificationDTO } from '@/models'
import { NotificationCard } from './NotificationCard'

type NotificationListProps = {
  notifications: NotificationDTO[]
  /** Phrase de l'état vide, propre à chaque onglet */
  emptyMessage: string
  /** Colonne du bouton ✓ (absente de l'onglet « Lues ») */
  showActions?: boolean
  /** Notification en cours de marquage */
  markingUuid?: string
  onOpen: (notification: NotificationDTO) => void
  onMarkRead: (notification: NotificationDTO) => void
}

/** Liste d'un onglet de la page /notifications, ou son état vide. */
export function NotificationList({
  notifications,
  emptyMessage,
  showActions = true,
  markingUuid,
  onOpen,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Empty className="gap-3 border border-solid bg-card py-16 md:py-16">
        <EmptyHeader>
          <EmptyMedia>
            <Inbox className="size-16 text-muted-foreground opacity-50" />
          </EmptyMedia>
          <EmptyTitle className="font-semibold text-foreground">Aucune notification</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification, index) => (
        <NotificationCard
          key={notification.uuid ?? index}
          notification={notification}
          showActions={showActions}
          isMarking={!!notification.uuid && notification.uuid === markingUuid}
          onOpen={onOpen}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  )
}

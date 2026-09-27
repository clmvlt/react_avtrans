import { Inbox } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { NotificationDTO } from '@/models'
import { NotificationCard } from './NotificationCard'

type NotificationListProps = {
  notifications: NotificationDTO[]
  /** Phrase de l'état vide, propre à chaque onglet */
  emptyMessage: string
  /** Bouton « Marquer comme lu » (absent de l'onglet « Lues ») */
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
      <Empty className="gap-4 rounded-xl border border-dashed px-4 py-12 md:px-4 md:py-12">
        <EmptyHeader className="gap-1">
          <EmptyMedia className="mb-3 size-14 rounded-full bg-muted">
            <Inbox className="size-7 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle className="text-base font-medium tracking-normal text-foreground">
            Aucune notification
          </EmptyTitle>
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

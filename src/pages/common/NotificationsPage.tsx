import { useState } from 'react'
import { List, Mail, MailOpen } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotificationsQuery } from '@/features/notifications/api/useNotificationsQuery'
import { NotificationList } from '@/features/notifications/components/NotificationList'
import { NotificationListSkeleton } from '@/features/notifications/components/NotificationListSkeleton'
import { NotificationsHeader } from '@/features/notifications/components/NotificationsHeader'
import { useMarkNotificationAsRead } from '@/features/notifications/hooks/useMarkNotificationAsRead'
import { useOpenNotification } from '@/features/notifications/hooks/useOpenNotification'

type NotificationFilter = 'all' | 'unread' | 'read'

const isNotificationFilter = (value: string): value is NotificationFilter =>
  value === 'all' || value === 'unread' || value === 'read'

/**
 * /notifications : toutes les notifications, en onglets Toutes / Non lues / Lues.
 * Même cache que la cloche de la navbar (le Vue ne les synchronisait pas).
 */
export default function NotificationsPage() {
  const notificationsQuery = useNotificationsQuery()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const openNotification = useOpenNotification()
  const { markAsRead, markingUuid } = useMarkNotificationAsRead()

  const notifications = notificationsQuery.data ?? []
  const unread = notifications.filter((notification) => !notification.isRead)
  const read = notifications.filter((notification) => notification.isRead)

  const listProps = { markingUuid, onOpen: openNotification, onMarkRead: markAsRead }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 py-6">
        <div className="mx-auto max-w-[1400px]">
          <NotificationsHeader total={notifications.length} unreadCount={unread.length} />

          {notificationsQuery.isPending ? (
            <NotificationListSkeleton />
          ) : notificationsQuery.isError ? (
            <ErrorState
              error={notificationsQuery.error}
              onRetry={() => void notificationsQuery.refetch()}
              isRetrying={notificationsQuery.isRefetching}
            />
          ) : (
            <Tabs
              value={filter}
              onValueChange={(value) => {
                if (isNotificationFilter(value)) setFilter(value)
              }}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="all">
                  <List className="mr-1.5 size-3.5" />
                  Toutes ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  <Mail className="mr-1.5 size-3.5" />
                  Non lues ({unread.length})
                </TabsTrigger>
                <TabsTrigger value="read">
                  <MailOpen className="mr-1.5 size-3.5" />
                  Lues ({read.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <NotificationList
                  notifications={notifications}
                  emptyMessage="Vous n'avez pas encore reçu de notification."
                  {...listProps}
                />
              </TabsContent>
              <TabsContent value="unread">
                <NotificationList
                  notifications={unread}
                  emptyMessage="Vous n'avez pas de notification non lue."
                  {...listProps}
                />
              </TabsContent>
              <TabsContent value="read">
                <NotificationList
                  notifications={read}
                  emptyMessage="Vous n'avez pas de notification lue."
                  showActions={false}
                  {...listProps}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}

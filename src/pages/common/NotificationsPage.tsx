import { useState } from 'react'
import { List, Mail, MailOpen } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotificationsQuery } from '@/features/notifications/api/useNotificationsQuery'
import { NotificationList } from '@/features/notifications/components/NotificationList'
import { NotificationListSkeleton } from '@/features/notifications/components/NotificationListSkeleton'
import { NotificationsActions } from '@/features/notifications/components/NotificationsActions'
import { useMarkNotificationAsRead } from '@/features/notifications/hooks/useMarkNotificationAsRead'
import { useOpenNotification } from '@/features/notifications/hooks/useOpenNotification'

type NotificationFilter = 'all' | 'unread' | 'read'

const isNotificationFilter = (value: string): value is NotificationFilter =>
  value === 'all' || value === 'unread' || value === 'read'

/**
 * /notifications : toutes les notifications, en onglets Toutes / Non lues / Lues (avec leurs
 * compteurs). Même cache que la cloche de l'en-tête (le Vue ne les synchronisait pas).
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
    <PageContainer size="md">
      <PageHeader
        title="Notifications"
        description="Toutes vos notifications, lues et non lues."
        actions={<NotificationsActions unreadCount={unread.length} />}
      />

      <div>
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
            className="gap-4"
          >
            <TabsList className="w-full sm:w-fit">
              <TabsTrigger value="all">
                <List className="size-3.5 max-sm:hidden" />
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                <Mail className="size-3.5 max-sm:hidden" />
                Non lues ({unread.length})
              </TabsTrigger>
              <TabsTrigger value="read">
                <MailOpen className="size-3.5 max-sm:hidden" />
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
    </PageContainer>
  )
}

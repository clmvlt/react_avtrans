import {
  Bell,
  CheckCheck,
  Inbox,
  List,
  LoaderCircle,
  TriangleAlert,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useServiceHistory } from '@/features/service-history/hooks/useServiceHistory'
import type { NotificationDTO } from '@/models'
import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'
import { useMarkAllNotificationsReadMutation } from '../api/useMarkAllNotificationsReadMutation'
import { useMarkNotificationReadMutation } from '../api/useMarkNotificationReadMutation'
import { useNotificationSound } from '../hooks/useNotificationSound'
import { useUnreadNotifications } from '../hooks/useUnreadNotifications'
import { getNotificationDestination } from '../lib/notificationMeta'
import { NotificationItem } from './NotificationItem'

/**
 * Cloche de l'en-tête de l'app : compteur, liste des non-lues, « Tout lu », « Voir tout », son.
 * Les effets de bord (polling, son, favicon, titre) sont dans useNotificationSideEffects, monté
 * une seule fois par AppLayout.
 */
export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const isAdmin = useAuthStore(selectIsAdmin)
  const { open: openServiceHistory } = useServiceHistory()
  const { notifications, unreadCount, error, isLoading } = useUnreadNotifications()
  const { soundEnabled, toggleSound } = useNotificationSound()
  const markRead = useMarkNotificationReadMutation()
  const markAllRead = useMarkAllNotificationsReadMutation()

  const leaveTo = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  const handleSelect = async (notification: NotificationDTO) => {
    if (markRead.isPending) return
    try {
      if (!notification.isRead && notification.uuid) {
        await markRead.mutateAsync(notification.uuid)
      }
    } catch {
      // Comme le Vue : échec ignoré, la liste reste ouverte
      return
    }

    const destination = getNotificationDestination(notification, isAdmin)
    if (destination?.kind === 'service-history') {
      setOpen(false)
      openServiceHistory(destination.serviceUuid)
    } else {
      leaveTo(destination?.to ?? '/notifications')
    }
  }

  return (
    <div className="relative inline-block">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="Notifications" className="relative">
            <Bell className="size-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={12}
          collisionPadding={12}
          className="flex max-h-[600px] w-[420px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-lg p-0 shadow-lg"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between gap-4 border-b bg-muted/50 px-5 py-3">
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
              >
                <CheckCheck className="size-3.5" />
                {markAllRead.isPending ? '...' : 'Tout lu'}
              </Button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-[450px] flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                <LoaderCircle className="size-8 animate-spin text-primary" />
                <p className="text-sm">Chargement...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-10 text-destructive">
                <TriangleAlert className="size-8" />
                <p className="text-sm">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                <Inbox className="size-12 opacity-50" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <NotificationItem
                  key={notification.uuid ?? index}
                  notification={notification}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>

          {/* Pied */}
          <div className="flex gap-2 border-t bg-muted/50 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => leaveTo('/notifications')}
            >
              <List className="size-3.5" />
              Voir tout
            </Button>
            <Button
              variant={soundEnabled ? 'ghost' : 'secondary'}
              size="sm"
              title={soundEnabled ? 'Couper le son' : 'Activer le son'}
              onClick={toggleSound}
            >
              {soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              {soundEnabled ? 'Son activé' : 'Son coupé'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

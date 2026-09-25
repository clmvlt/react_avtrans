import { useQueryClient } from '@tanstack/react-query'
import { CheckCheck, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { markNotificationsReadInList } from '../api/notificationListCache'
import { useMarkAllNotificationsReadMutation } from '../api/useMarkAllNotificationsReadMutation'

let testAudio: HTMLAudioElement | null = null

/** « Test son » (développement) : joue le son même s'il est coupé dans la cloche, comme le Vue. */
function playTestSound() {
  try {
    if (!testAudio) {
      testAudio = new Audio('/sounds/notif.wav')
      testAudio.volume = 0.5
    }
    testAudio.currentTime = 0
    testAudio.play().catch((err: Error) => {
      console.error('[Notifications] Cannot play test sound:', err.message)
    })
  } catch (err) {
    console.error('[Notifications] Cannot play test sound:', err)
  }
}

type NotificationsHeaderProps = {
  total: number
  unreadCount: number
}

/** En-tête de /notifications : compteurs, « Test son » (dev) et « Tout marquer comme lu ». */
export function NotificationsHeader({ total, unreadCount }: NotificationsHeaderProps) {
  const queryClient = useQueryClient()
  const markAllRead = useMarkAllNotificationsReadMutation()

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => markNotificationsReadInList(queryClient),
      // Le Vue remplaçait toute la page par l'erreur : toast à la place (MIGRATION.md 8.1)
      onError: (err) => {
        toast.error('Erreur', {
          description: err instanceof Error ? err.message : 'Erreur lors de la mise à jour',
        })
      },
    })
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {total} notification{total > 1 ? 's' : ''}{' '}
          {unreadCount > 0 && (
            <Badge variant="outline" className="ml-2 border-primary/50 text-primary">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </Badge>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {import.meta.env.DEV && (
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/50 text-amber-600"
            onClick={playTestSound}
          >
            <Volume2 className="size-3.5" />
            Test son
          </Button>
        )}
        {unreadCount > 0 && (
          <Button size="sm" disabled={markAllRead.isPending} onClick={handleMarkAllRead}>
            <CheckCheck className="size-3.5" />
            {markAllRead.isPending ? 'Chargement...' : 'Tout marquer comme lu'}
          </Button>
        )}
      </div>
    </div>
  )
}

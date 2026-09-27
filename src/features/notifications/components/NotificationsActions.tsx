import { useQueryClient } from '@tanstack/react-query'
import { CheckCheck, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
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

type NotificationsActionsProps = {
  unreadCount: number
}

/**
 * Actions de l'en-tête de /notifications : « Test son » (développement) et « Tout marquer comme
 * lu » (seulement s'il reste des non-lues). Les compteurs sont dans les onglets de la page.
 */
export function NotificationsActions({ unreadCount }: NotificationsActionsProps) {
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
    <>
      {import.meta.env.DEV && (
        <Button
          variant="outline"
          size="sm"
          className="border-warning/50 text-warning"
          onClick={playTestSound}
        >
          <Volume2 className="size-4" />
          Test son
        </Button>
      )}
      {unreadCount > 0 && (
        <Button size="sm" disabled={markAllRead.isPending} onClick={handleMarkAllRead}>
          <CheckCheck className="size-4" />
          {markAllRead.isPending ? 'Chargement...' : 'Tout marquer comme lu'}
        </Button>
      )}
    </>
  )
}

import { useEffect, useRef } from 'react'
import { clearFaviconBadge, setFaviconBadgeCount } from '@/lib/faviconBadge'
import { useNotificationSound } from './useNotificationSound'
import { useUnreadNotifications } from './useUnreadNotifications'

/**
 * Effets de bord des notifications non lues, montés UNE seule fois (AppLayout) : polling de 5 s,
 * son quand le nombre de non-lues augmente, badge du favicon. Le Vue les montait deux fois
 * (Navbar et menu mobile : double polling, double son, favicon effacé à la fermeture du menu).
 * Renvoie le nombre de non-lues, qu'AppLayout affiche dans le titre de l'onglet.
 */
export function useNotificationSideEffects(): number {
  const { unreadCount, loadedUnreadCount } = useUnreadNotifications({ poll: true })
  const { playSound } = useNotificationSound()
  const previousCountRef = useRef<number | null>(null)

  // Son : seulement si le nombre augmente d'un chargement réussi à l'autre (jamais au premier)
  useEffect(() => {
    if (loadedUnreadCount === null) return
    const previous = previousCountRef.current
    previousCountRef.current = loadedUnreadCount
    if (previous !== null && loadedUnreadCount > previous) playSound()
  }, [loadedUnreadCount, playSound])

  // Badge du favicon
  useEffect(() => {
    void setFaviconBadgeCount(unreadCount)
  }, [unreadCount])

  // Favicon d'origine en quittant l'app authentifiée (déconnexion, page publique)
  useEffect(() => clearFaviconBadge, [])

  return unreadCount
}

import { ApiError } from '@/api'
import { useUnreadNotificationsQuery } from '../api/useUnreadNotificationsQuery'

/** Erreur réseau ou timeout pendant le polling : le Vue gardait l'état précédent sans rien afficher. */
const isSilentError = (error: Error) =>
  error instanceof ApiError && (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT')

type UseUnreadNotificationsOptions = {
  /** Porte le polling de 5 s (un seul appelant : voir useUnreadNotificationsQuery) */
  poll?: boolean
}

/**
 * État affiché de la cloche, avec les règles du Vue : toute autre erreur est affichée à la place
 * de la liste et remet le compteur à 0 (jusqu'au prochain chargement réussi).
 */
export function useUnreadNotifications({ poll = false }: UseUnreadNotificationsOptions = {}) {
  const query = useUnreadNotificationsQuery({ poll })

  const notifications = query.data ?? []
  const error =
    query.error && !isSilentError(query.error)
      ? query.error.message || 'Erreur lors du chargement'
      : null
  // Compteur calculé sur les notifications reçues, comme le Vue
  const loadedUnreadCount = query.data ? notifications.filter((n) => !n.isRead).length : null

  return {
    notifications,
    /** Nombre affiché (cloche, titre, favicon) */
    unreadCount: error ? 0 : (loadedUnreadCount ?? 0),
    /** Nombre issu du dernier chargement réussi (null avant le premier) : sert au son */
    loadedUnreadCount,
    error,
    /** Premier chargement en cours (les rafraîchissements suivants sont silencieux) */
    isLoading: query.isLoading,
  }
}

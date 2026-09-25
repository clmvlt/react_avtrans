/** Clés TanStack Query des notifications (popover de la navbar et page /notifications). */
export const notificationsKeys = {
  all: ['notifications'] as const,
  /** Toutes les notifications (GET /notifications, page /notifications) */
  list: () => [...notificationsKeys.all, 'list'] as const,
  /** Non lues (GET /notifications/unread, cloche de la navbar, interrogée toutes les 5 s) */
  unread: () => [...notificationsKeys.all, 'unread'] as const,
}

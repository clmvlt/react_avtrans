/**
 * Clés TanStack Query de l'historique des actions admin sur les pointages
 * (GET /services/admin/{uuid}/modifications). À compléter par le journal des pointages.
 * Invalider `all` après un ajout, une modification ou une suppression de pointage.
 */
export const serviceHistoryKeys = {
  all: ['services', 'admin', 'modifications'] as const,
  byService: (serviceUuid: string) => [...serviceHistoryKeys.all, 'service', serviceUuid] as const,
}

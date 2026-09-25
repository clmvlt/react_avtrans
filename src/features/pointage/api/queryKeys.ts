import type { ServiceSearchParams } from '@/services'

/**
 * Clés TanStack Query du pointage de l'utilisateur connecté (`/services/*` sans `admin`).
 * Les pointages côté admin vivent sous `['services', 'admin', …]` (user-services, service-history).
 */
export const pointageKeys = {
  all: ['services', 'me'] as const,
  active: () => [...pointageKeys.all, 'active'] as const,
  hours: () => [...pointageKeys.all, 'hours'] as const,
  daily: () => [...pointageKeys.all, 'daily'] as const,
  histories: () => [...pointageKeys.all, 'history'] as const,
  history: (params: ServiceSearchParams) => [...pointageKeys.histories(), params] as const,
  /** GET /users/me/kilometrage (dernier relevé + saisie du jour) */
  lastKilometrage: () => ['users', 'me', 'kilometrage'] as const,
}

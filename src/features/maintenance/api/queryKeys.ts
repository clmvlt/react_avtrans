import type { EntretienSearchParams } from '@/services'

/**
 * Paramètres de POST /entretiens/history. Le service ne déclare pas `dossierId`, que l'API
 * accepte et que le Vue envoie (Record libre) : on l'ajoute ici sans toucher au service.
 */
export type EntretienHistoryParams = EntretienSearchParams & { dossierId?: string }

/** Clés TanStack Query du domaine entretiens (racine `['maintenance']`). */
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  /** Prochains entretiens (flotte et véhicule) : invalidés après chaque entretien ou configuration. */
  upcoming: () => [...maintenanceKeys.all, 'upcoming'] as const,
  fleetUpcoming: () => [...maintenanceKeys.upcoming(), 'fleet'] as const,
  vehicleUpcoming: (vehiculeId: string) =>
    [...maintenanceKeys.upcoming(), 'vehicule', vehiculeId] as const,
  /** Historiques et fichiers des entretiens. */
  entretiens: () => [...maintenanceKeys.all, 'entretiens'] as const,
  histories: () => [...maintenanceKeys.entretiens(), 'history'] as const,
  history: (params: EntretienHistoryParams) => [...maintenanceKeys.histories(), params] as const,
  files: (entretienId: string) => [...maintenanceKeys.entretiens(), entretienId, 'files'] as const,
  types: () => [...maintenanceKeys.all, 'types'] as const,
  dossiers: () => [...maintenanceKeys.all, 'dossiers'] as const,
  configs: () => [...maintenanceKeys.all, 'configs'] as const,
  vehicleConfigs: (vehiculeId: string) =>
    [...maintenanceKeys.configs(), 'vehicule', vehiculeId] as const,
}

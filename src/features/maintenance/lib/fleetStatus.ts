import type { TypeEntretienDTO, VehiculeDTO, VehiculeProchainEntretienDTO } from '@/models'

export type FleetAlert = {
  type: 'KM' | 'DATE'
  typeEntretien: TypeEntretienDTO | undefined
  targetValue: number | string | Date
  /** Kilomètres ou jours restants (négatif en cas de retard). */
  remaining: number
  isLate: boolean
  message: string
}

export type FleetStatus = 'OK' | 'WARNING' | 'DANGER'

export type FleetVehicleStatus = {
  id: string
  vehicule: VehiculeDTO
  status: FleetStatus
  alerts: FleetAlert[]
}

/** Seuils du palier « À venir » (Entretiens.vue) : 10 000 km ou 90 jours. */
export const FLEET_THRESHOLDS = { km: 10000, days: 90 } as const

const STATUS_SCORE: Record<FleetStatus, number> = { DANGER: 3, WARNING: 2, OK: 1 }

/**
 * Statut d'entretien de **chaque véhicule du parc** (pas seulement ceux renvoyés par l'API des
 * prochains entretiens), repris de `fleetStatusList` d'Entretiens.vue :
 * - `DANGER` si une alerte est en retard ;
 * - sinon `WARNING` si une alerte km reste entre 0 et 10 000 km, ou une alerte date entre 0 et 90 j ;
 * - sinon `OK`.
 * Alertes en retard d'abord ; véhicules triés DANGER > WARNING > OK (tri stable).
 */
export function computeFleetStatus(
  vehicules: VehiculeDTO[],
  prochains: VehiculeProchainEntretienDTO[],
): FleetVehicleStatus[] {
  const alertsByVehicle = new Map<string, VehiculeProchainEntretienDTO>()
  for (const item of prochains) {
    if (item.vehicule?.id) alertsByVehicle.set(item.vehicule.id, item)
  }

  const dashboard: FleetVehicleStatus[] = []
  for (const vehicule of vehicules) {
    if (!vehicule.id) continue

    const alerts: FleetAlert[] = []
    const data = alertsByVehicle.get(vehicule.id)
    const km = data?.prochainEntretienKm
    const date = data?.prochainEntretienDate

    if (km) {
      alerts.push({
        type: 'KM',
        typeEntretien: km.typeEntretien,
        targetValue: km.prochainKilometrage || 0,
        remaining: km.kmRestants || 0,
        isLate: km.enRetard || false,
        message: km.message || '',
      })
    }
    if (date) {
      alerts.push({
        type: 'DATE',
        typeEntretien: date.typeEntretien,
        targetValue: date.prochaineDateTemporelle || '',
        remaining: date.joursRestants || 0,
        isLate: date.enRetard || false,
        message: date.message || '',
      })
    }

    let status: FleetStatus = 'OK'
    if (km?.enRetard || date?.enRetard) {
      status = 'DANGER'
    } else if (
      alerts.some((alert) =>
        alert.type === 'KM'
          ? alert.remaining >= 0 && alert.remaining <= FLEET_THRESHOLDS.km
          : alert.remaining >= 0 && alert.remaining <= FLEET_THRESHOLDS.days,
      )
    ) {
      status = 'WARNING'
    }

    alerts.sort((a, b) => Number(b.isLate) - Number(a.isLate))
    dashboard.push({ id: vehicule.id, vehicule, status, alerts })
  }

  return dashboard.sort((a, b) => STATUS_SCORE[b.status] - STATUS_SCORE[a.status])
}

/** Les trois sections du tableau de bord : en retard, à venir, à jour. */
export function groupFleetStatus(list: FleetVehicleStatus[]) {
  return {
    late: list.filter((v) => v.status === 'DANGER'),
    upcoming: list.filter((v) => v.status === 'WARNING'),
    ok: list.filter((v) => v.status === 'OK'),
  }
}

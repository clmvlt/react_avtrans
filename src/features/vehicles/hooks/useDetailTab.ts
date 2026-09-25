import { useState } from 'react'

export const VEHICLE_DETAIL_TABS = [
  'fichiers',
  'kilometrages',
  'adjustInfos',
  'rapports',
  'equipements',
] as const

export type VehicleDetailTab = (typeof VEHICLE_DETAIL_TABS)[number]

const isVehicleDetailTab = (value: string): value is VehicleDetailTab =>
  (VEHICLE_DETAIL_TABS as readonly string[]).includes(value)

/**
 * Onglet actif du détail véhicule : état local, « Fichiers » par défaut, perdu en quittant la
 * page (décision Q-URL : pas d'onglet dans l'URL, comme le Vue).
 */
export function useDetailTab() {
  const [tab, setTab] = useState<VehicleDetailTab>('fichiers')

  const onTabChange = (value: string) => {
    if (isVehicleDetailTab(value)) setTab(value)
  }

  return [tab, onTabChange] as const
}

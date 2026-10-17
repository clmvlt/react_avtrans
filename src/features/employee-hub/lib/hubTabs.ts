import type { LucideIcon } from 'lucide-react'
import { BedDouble, CalendarX2, Clock, Coins, LayoutDashboard, PenLine, Timer } from 'lucide-react'

export type HubTab =
  'apercu' | 'pointages' | 'absences' | 'acomptes' | 'heures' | 'signatures' | 'couchettes'

export type HubTabConfig = {
  value: HubTab
  label: string
  icon: LucideIcon
  /** Onglet réservé aux employés qui ont la permission couchette */
  couchetteOnly?: boolean
}

export const DEFAULT_HUB_TAB: HubTab = 'apercu'

export const HUB_TABS: HubTabConfig[] = [
  { value: 'apercu', label: 'Aperçu', icon: LayoutDashboard },
  { value: 'pointages', label: 'Pointages', icon: Timer },
  { value: 'absences', label: 'Absences', icon: CalendarX2 },
  { value: 'acomptes', label: 'Acomptes', icon: Coins },
  { value: 'heures', label: 'Heures', icon: Clock },
  { value: 'signatures', label: 'Signatures', icon: PenLine },
  { value: 'couchettes', label: 'Couchettes', icon: BedDouble, couchetteOnly: true },
]

/** Onglets proposés pour un employé (Couchettes seulement s'il en a la permission). */
export const visibleHubTabs = (isCouchette: boolean) =>
  HUB_TABS.filter((tab) => !tab.couchetteOnly || isCouchette)

/** Onglet lu dans l'URL ; inconnu ou indisponible pour cet employé : l'aperçu. */
export function parseHubTab(value: string | null, isCouchette: boolean): HubTab {
  const tab = visibleHubTabs(isCouchette).find((item) => item.value === value)
  return tab?.value ?? DEFAULT_HUB_TAB
}

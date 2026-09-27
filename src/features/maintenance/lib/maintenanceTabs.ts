import { Settings, Wrench } from 'lucide-react'
import type { PageTab } from '@/components/layout/PageTabs'

/** Onglets des pages des entretiens de la flotte */
export const MAINTENANCE_TABS: PageTab[] = [
  { to: '/entretiens', label: 'Entretiens', icon: Wrench },
  { to: '/types-entretien', label: "Types d'entretien", icon: Settings },
]

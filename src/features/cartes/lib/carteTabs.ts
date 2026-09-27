import { CreditCard, Tags } from 'lucide-react'
import type { PageTab } from '@/components/layout/PageTabs'

/** Onglets des pages d'administration des cartes */
export const CARTE_TABS: PageTab[] = [
  { to: '/cartes', label: 'Cartes', icon: CreditCard },
  { to: '/types-cartes', label: 'Types de cartes', icon: Tags },
]

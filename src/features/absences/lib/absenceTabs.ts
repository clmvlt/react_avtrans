import { CalendarX2, Tags } from 'lucide-react'
import type { PageTab } from '@/components/layout/PageTabs'

/** Onglets des pages d'administration des absences */
export const ABSENCE_TABS: PageTab[] = [
  { to: '/absences', label: 'Demandes', icon: CalendarX2 },
  { to: '/absence-types', label: "Types d'absence", icon: Tags },
]
